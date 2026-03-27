import { pool } from '../config/db';

export const saleRepository = {
  async createSale(userId: string, items: { productId: string; quantity: number }[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let totalAmount = 0;
      const saleItemsToInsert = [];

      for (const item of items) {
        // Lock the product row for update to prevent race conditions
        const productRes = await client.query(
          'SELECT name, price, quantity FROM products WHERE id = $1 FOR UPDATE',
          [item.productId]
        );

        if (productRes.rows.length === 0) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const product = productRes.rows[0];

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
        }

        // Deduct inventory
        await client.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );

        const subtotal = Number(product.price) * item.quantity;
        totalAmount += subtotal;

        saleItemsToInsert.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal
        });
      }

      // Create Sale Header
      const saleRes = await client.query(
        'INSERT INTO sales (user_id, total_amount) VALUES ($1, $2) RETURNING *',
        [userId, totalAmount]
      );
      const saleId = saleRes.rows[0].id;

      // Insert Sale Items
      for (const saleItem of saleItemsToInsert) {
        await client.query(
          'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5)',
          [saleId, saleItem.productId, saleItem.quantity, saleItem.unitPrice, saleItem.subtotal]
        );
      }

      await client.query('COMMIT');
      return saleRes.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async getSales(limit: number = 50, offset: number = 0) {
    const res = await pool.query(`
      SELECT s.*, u.email as user_email 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return res.rows;
  },

  async getSaleDetails(saleId: string) {
    const saleRes = await pool.query(`
      SELECT s.*, u.email as user_email 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1
    `, [saleId]);

    if (saleRes.rows.length === 0) return null;

    const itemsRes = await pool.query(`
      SELECT si.*, p.name as product_name, p.sku 
      FROM sale_items si 
      LEFT JOIN products p ON si.product_id = p.id 
      WHERE si.sale_id = $1
    `, [saleId]);

    return {
      ...saleRes.rows[0],
      items: itemsRes.rows
    };
  }
};
