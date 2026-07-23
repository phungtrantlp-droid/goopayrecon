import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  role: string;
  email: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions);
}

export function verifyToken(token: string): DecodedToken {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.verify(token, secret) as DecodedToken;
}
