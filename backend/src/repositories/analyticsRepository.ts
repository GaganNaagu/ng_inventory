import { pool } from '../config/db';

export const analyticsRepository = {
  async getSalesSummary() {
    // We calculate Today, This Week, and This Month totals
    const todayRes = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM sales 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    const weekRes = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM sales 
      WHERE created_at >= date_trunc('week', current_date)
    `);

    const monthRes = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM sales 
      WHERE created_at >= date_trunc('month', current_date)
    `);

    return {
      today: parseFloat(todayRes.rows[0].total),
      thisWeek: parseFloat(weekRes.rows[0].total),
      thisMonth: parseFloat(monthRes.rows[0].total),
    };
  },

  async getTopProducts(limit: number = 5) {
    const res = await pool.query(`
      SELECT 
        p.id, p.name, p.sku, 
        SUM(si.quantity) as total_sold,
        SUM(si.subtotal) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'COMPLETED'
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sold DESC
      LIMIT $1
    `, [limit]);
    
    return res.rows.map(r => ({
      ...r,
      total_sold: parseInt(r.total_sold),
      total_revenue: parseFloat(r.total_revenue)
    }));
  },

  async getLowStockProducts() {
    const res = await pool.query(`
      SELECT id, name, sku, quantity, reorder_threshold
      FROM products
      WHERE quantity <= reorder_threshold
      ORDER BY quantity ASC
    `);
    return res.rows;
  }
};
