import { pool } from '../src/config/db';

async function seedDummyData() {
  try {
    console.log('Inserting dummy categories...');
    const catResult = await pool.query(`
      INSERT INTO categories (name) VALUES 
      ('Electronics'),
      ('Clothing'),
      ('Groceries'),
      ('Home & Kitchen')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);

    // If already exists, we might need to fetch them
    const allCats = await pool.query('SELECT id, name FROM categories;');
    const categories: Record<string, string> = {};
    for (const row of allCats.rows) {
      categories[row.name] = row.id;
    }

    console.log('Inserting dummy products...');
    const products = [
      { name: 'Wireless Mouse', sku: 'ELEC-MOU-001', desc: 'Ergonomic wireless mouse', price: 25.99, qty: 150, category: 'Electronics' },
      { name: 'Mechanical Keyboard', sku: 'ELEC-KEY-002', desc: 'RGB mechanical keyboard', price: 89.99, qty: 50, category: 'Electronics' },
      { name: 'Cotton T-Shirt', sku: 'CLO-TSH-001', desc: '100% cotton basic t-shirt', price: 15.00, qty: 200, category: 'Clothing' },
      { name: 'Denim Jeans', sku: 'CLO-JEA-002', desc: 'Classic blue denim jeans', price: 49.99, qty: 100, category: 'Clothing' },
      { name: 'Organic Coffee Beans', sku: 'GRO-COF-001', desc: '1kg organic Arabica beans', price: 18.50, qty: 80, category: 'Groceries' },
      { name: 'Stainless Steel Pan', sku: 'HOM-PAN-001', desc: 'Non-stick stainless steel frying pan', price: 35.00, qty: 40, category: 'Home & Kitchen' },
      { name: 'Bluetooth Headphones', sku: 'ELEC-HDP-003', desc: 'Noise-cancelling over-ear headphones', price: 120.00, qty: 30, category: 'Electronics' },
      { name: 'Winter Jacket', sku: 'CLO-JAC-003', desc: 'Waterproof insulated winter jacket', price: 85.00, qty: 25, category: 'Clothing' },
      { name: 'Olive Oil', sku: 'GRO-OIL-002', desc: '500ml extra virgin olive oil', price: 12.00, qty: 60, category: 'Groceries' },
      { name: 'Blender', sku: 'HOM-BLE-002', desc: 'High-speed 1000W blender', price: 65.00, qty: 20, category: 'Home & Kitchen' }
    ];

    for (const p of products) {
      await pool.query(`
        INSERT INTO products (name, sku, description, price, quantity, reorder_threshold, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (sku) DO NOTHING;
      `, [p.name, p.sku, p.desc, p.price, p.qty, 10, categories[p.category]]);
    }

    console.log('✅ Dummy data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding dummy data:', err);
    process.exit(1);
  }
}

seedDummyData();
