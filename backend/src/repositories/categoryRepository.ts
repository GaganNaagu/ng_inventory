import { pool } from '../config/db';

export const categoryRepository = {
  async findAll() {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  },

  async findById(id: string) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async create(name: string) {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  },

  async update(id: string, name: string) {
    const result = await pool.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    // Check if any products are linked
    const linked = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(linked.rows[0].count) > 0) {
      throw new Error('Cannot delete category with linked products');
    }
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
};
