
// Этот файл можно удалить после полной миграции на Supabase,
// так как аутентификация теперь обрабатывается через Supabase

import * as jose from 'jose';
import { UserProfile } from '../types/auth-types';

// Secret key for signing tokens (in a real application, this should be in env variables)
const JWT_SECRET = 'anvik-soft-skills-hub-secret-key-2024';
const JWT_EXPIRY = '24h';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Convert string to Uint8Array for use with jose
const textEncoder = new TextEncoder();
const secretKey = textEncoder.encode(JWT_SECRET);

/**
 * Creates a JWT token based on user data
 */
export const generateToken = async (user: UserProfile): Promise<string> => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRY)
    .sign(secretKey);
  
  return token;
};

/**
 * Verifies token validity and returns decoded data
 */
export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Retrieves token from local storage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Stores token in local storage
 */
export const storeToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Removes token from local storage
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Checks if the token has expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    // Compare expiration time with current time
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
