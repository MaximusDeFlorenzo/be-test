import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}