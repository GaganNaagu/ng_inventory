import { Request, Response } from 'express';
import { verifyCredentialsAndGenerateToken } from '../services/authService';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await verifyCredentialsAndGenerateToken(email, password);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax', // Use 'none' in production for cross-domain support
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ message: 'Login successful', user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ message: 'Logout successful' });
};

export const me = (req: any, res: Response) => {
  res.json({ user: req.user });
};
