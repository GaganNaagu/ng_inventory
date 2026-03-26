import bcrypt from 'bcrypt';
import { pool } from '../src/config/db';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@store.com';
  const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const role = 'Admin';

  try {
    const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
      [email, passwordHash, role]
    );

    console.log(`✅ Admin user created: ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
