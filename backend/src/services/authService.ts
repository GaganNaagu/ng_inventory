import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

export const verifyCredentialsAndGenerateToken = async (email: string, password: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};
