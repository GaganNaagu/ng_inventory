import { pool } from '../config/db';

interface ProductFilters {
  search?: string;
  category_id?: string;
  low_stock?: boolean;
}

export const productRepository = {
  async findAll(filters: ProductFilters = {}) {
    let query = `
      SELECT p.*, c.name AS category_name,
        (p.quantity <= p.reorder_threshold) AS is_low_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.low_stock) {
      query += ` AND p.quantity <= p.reorder_threshold`;
    }

    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async findById(id: string) {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name,
        (p.quantity <= p.reorder_threshold) AS is_low_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0] || null;
  },

  async create(data: {
    name: string; sku: string; description?: string;
    price: number; quantity: number; reorder_threshold: number;
    category_id?: string; expiry_date?: string;
  }) {
    const result = await pool.query(`
      INSERT INTO products (name, sku, description, price, quantity, reorder_threshold, category_id, expiry_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [data.name, data.sku, data.description || null, data.price, data.quantity,
        data.reorder_threshold, data.category_id || null, data.expiry_date || null]);
    return result.rows[0];
  },

  async update(id: string, data: {
    name?: string; sku?: string; description?: string;
    price?: number; quantity?: number; reorder_threshold?: number;
    category_id?: string; expiry_date?: string;
  }) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const updatableFields = ['name', 'sku', 'description', 'price', 'quantity', 'reorder_threshold', 'category_id', 'expiry_date'];
    for (const field of updatableFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        params.push((data as any)[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) throw new Error('No fields to update');

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};
