
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth-types';

interface AuthHookReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthState = (): AuthHookReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка сохранённого пользователя при инициализации
  useEffect(() => {
    const savedUser = localStorage.getItem('anvik_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('Loaded user from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('anvik_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    console.log('Attempting login for:', email);

    try {
      // Ищем пользователя в базе данных
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (dbError || !userData) {
        console.error('Login failed:', dbError?.message || 'User not found');
        setIsLoading(false);
        return { success: false, error: 'Неверный email или пароль' };
      }

      // Создаём объект пользователя
      const userProfile: UserProfile = {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        department: userData.department || '',
        position: userData.position || '',
        avatarUrl: userData.avatar_url || ''
      };

      // Сохраняем пользователя
      setUser(userProfile);
      localStorage.setItem('anvik_user', JSON.stringify(userProfile));
      
      console.log('Login successful:', userProfile);
      setIsLoading(false);
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Произошла ошибка при входе' };
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('anvik_user');
    console.log('User logged out');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
};
