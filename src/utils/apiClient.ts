
import { supabase } from '@/integrations/supabase/client';

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
}

/**
 * Performs a fetch request with automatic JWT token addition
 * This функция осталась для совместимости с существующим кодом,
 * но теперь использует Supabase для запросов
 */
export async function apiRequest<T>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { authRequired = true, ...fetchOptions } = options;
  
  // Проверка аутентификации если требуется
  if (authRequired) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }
  }
  
  // Выполнение запроса через fetch (для совместимости)
  const response = await fetch(url, fetchOptions);
  
  // Проверка ответа
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Authorization error: token is invalid or expired');
    }
    
    // Попытка получить текст ошибки
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  // Парсинг JSON-ответа
  const data = await response.json();
  return data as T;
}

/**
 * GET request function
 */
export function get<T>(url: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request function
 */
export function post<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request function
 */
export function put<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request function
 */
export function del<T>(url: string, options: RequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}
