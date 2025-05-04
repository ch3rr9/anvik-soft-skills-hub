
import { getStoredToken } from './jwtUtils';

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
}

/**
 * Выполняет fetch запрос с автоматическим добавлением JWT токена
 */
export async function apiRequest<T>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { authRequired = true, ...fetchOptions } = options;
  
  // Настройки запроса по умолчанию
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  };
  
  // Если требуется авторизация, добавляем токен в заголовки
  if (authRequired) {
    const token = getStoredToken();
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  
  // Выполняем запрос
  const response = await fetch(url, defaultOptions);
  
  // Проверяем статус ответа
  if (!response.ok) {
    // Если статус 401 (Unauthorized), возможно истек токен
    if (response.status === 401) {
      // В реальном приложении здесь можно реализовать логику обновления токена
      console.error('Ошибка авторизации: токен недействителен или истек');
    }
    
    // Пытаемся получить текст ошибки из ответа
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  // Парсим JSON ответ
  const data = await response.json();
  return data as T;
}

/**
 * Функция GET запроса
 */
export function get<T>(url: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Функция POST запроса
 */
export function post<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Функция PUT запроса
 */
export function put<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Функция DELETE запроса
 */
export function del<T>(url: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}
