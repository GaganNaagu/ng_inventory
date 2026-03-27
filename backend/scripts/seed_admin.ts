import bcrypt from 'bcrypt';
import { pool } from '../src/config/db';

async function seedUsers() {
  const defaultUsers = [
    { email: process.env.ADMIN_EMAIL || 'admin@store.com', password: process.env.ADMIN_PASSWORD || 'admin123', role: 'Admin' },
    { email: 'manager@store.com', password: 'manager123', role: 'Manager' },
    { email: 'staff@store.com', password: 'staff123', role: 'Staff' }
  ];

  try {
    const saltRounds = 10;

    for (const user of defaultUsers) {
      const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (checkUser.rows.length > 0) {
        console.log(`${user.role} user already exists: ${user.email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash(user.password, saltRounds);

      await pool.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
        [user.email, passwordHash, user.role]
      );

      console.log(`✅ ${user.role} user created: ${user.email}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
}

seedUsers();
