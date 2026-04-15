import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

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

console.log("ACCESS SECRET:", JWT_SECRET);
console.log("REFRESH SECRET:", JWT_REFRESH_SECRET);