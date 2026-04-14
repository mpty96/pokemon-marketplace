import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

export function generateAccessToken(payload: JwtPayload): string {
  return (jwt as any).sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return (jwt as any).sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return (jwt as any).verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return (jwt as any).verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}