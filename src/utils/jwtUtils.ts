
import jwt from 'jsonwebtoken';
import { UserProfile } from '../types/auth-types';

// Секретный ключ для подписи токенов (в реальном приложении должен быть в env переменных)
const JWT_SECRET = 'anvik-soft-skills-hub-secret-key-2024';
const JWT_EXPIRY = '24h';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Создает JWT токен на основе данных пользователя
 */
export const generateToken = (user: UserProfile): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Проверяет валидность токена и возвращает декодированные данные
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Ошибка верификации токена:', error);
    return null;
  }
};

/**
 * Извлекает токен из локального хранилища
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Сохраняет токен в локальное хранилище
 */
export const storeToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Удаляет токен из локального хранилища
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Проверяет, истек ли срок действия токена
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) return true;
    
    // Сравниваем время истечения с текущим временем
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
