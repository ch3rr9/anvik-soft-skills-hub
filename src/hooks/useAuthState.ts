
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
      // Сначала пытаемся найти в базе данных
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      console.log('Database query result:', userData, dbError);

      let userProfile: UserProfile | null = null;

      if (userData && !dbError) {
        // Пользователь найден в базе данных
        userProfile = {
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          department: userData.department || '',
          position: userData.position || '',
          avatarUrl: userData.avatar_url || ''
        };
        console.log('User found in database:', userProfile);
      } else {
        // Fallback: ищем в localStorage
        console.log('User not found in database, checking localStorage fallback...');
        const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const localUser = demoUsers.find((u: any) => u.email === email && u.password === password);
        
        if (localUser) {
          userProfile = {
            id: localUser.id.toString(),
            name: localUser.name,
            email: localUser.email,
            role: localUser.role as UserRole,
            department: localUser.department || '',
            position: localUser.position || '',
            avatarUrl: localUser.avatar_url || ''
          };
          console.log('User found in localStorage fallback:', userProfile);
        }
      }

      if (!userProfile) {
        console.error('Login failed: User not found');
        setIsLoading(false);
        return { success: false, error: 'Неверный email или пароль' };
      }

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
