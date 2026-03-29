import { pool } from '../config/db';
import { saleRepository } from '../repositories/saleRepository';

// These are integration tests that run against the real database.
// Ensure DATABASE_URL points to a test-safe database before running.

describe('Sales Transaction Engine', () => {
  let testProductId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Ensure uuid extension exists
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create a test user
    const userRes = await pool.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ('test-sale@test.com', '$2b$10$dummyhashedpassword1234567890abc', 'Staff') 
       ON CONFLICT(email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`
    );
    testUserId = userRes.rows[0].id;

    // Create a test product with known quantity
    const productRes = await pool.query(
      `INSERT INTO products (name, sku, price, quantity, reorder_threshold)
       VALUES ('Test Product', 'TEST-SKU-001', 100.00, 10, 2)
       RETURNING id`
    );
    testProductId = productRes.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    await pool.query('DELETE FROM sale_items WHERE product_id = $1', [testProductId]);
    await pool.query('DELETE FROM sales WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM products WHERE id = $1', [testProductId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  test('successful sale deducts stock correctly', async () => {
    const sale = await saleRepository.createSale(testUserId, [
      { productId: testProductId, quantity: 3 }
    ]);

    expect(sale).toBeDefined();
    expect(sale.id).toBeDefined();
    expect(parseFloat(sale.total_amount)).toBe(300.00); // 3 x 100

    // Verify stock was deducted
    const productRes = await pool.query('SELECT quantity FROM products WHERE id = $1', [testProductId]);
    expect(productRes.rows[0].quantity).toBe(7); // 10 - 3
  });

  test('oversell prevention — rejects sale exceeding stock', async () => {
    // Product now has 7 units (from previous test)
    await expect(
      saleRepository.createSale(testUserId, [
        { productId: testProductId, quantity: 100 } // Way more than available
      ])
    ).rejects.toThrow('Insufficient stock');

    // Verify stock was NOT changed (rollback worked)
    const productRes = await pool.query('SELECT quantity FROM products WHERE id = $1', [testProductId]);
    expect(productRes.rows[0].quantity).toBe(7); // Unchanged
  });

  test('empty cart rejection — service layer validation', async () => {
    // The saleService validates empty carts, but let's test the repository
    // with an empty array too — it should still work without errors at the DB level
    // but the service layer should catch it first.
    const { saleService } = require('../services/saleService');

    await expect(
      saleService.checkout(testUserId, [])
    ).rejects.toThrow('Cart is empty');
  });
});
