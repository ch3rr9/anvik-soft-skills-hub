
import { getStoredToken, verifyToken } from './jwtUtils';

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
}

/**
 * Performs a fetch request with automatic JWT token addition
 */
export async function apiRequest<T>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { authRequired = true, ...fetchOptions } = options;
  
  // Default request settings
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  };
  
  // If authorization is required, add token to headers
  if (authRequired) {
    const token = getStoredToken();
    if (token) {
      // Verify token validity
      const isValid = await verifyToken(token);
      
      if (isValid) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  }
  
  // Perform request
  const response = await fetch(url, defaultOptions);
  
  // Check response status
  if (!response.ok) {
    // If status is 401 (Unauthorized), token might have expired
    if (response.status === 401) {
      // In a real application, token refresh logic could be implemented here
      console.error('Authorization error: token is invalid or expired');
    }
    
    // Try to get error text from response
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  // Parse JSON response
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
