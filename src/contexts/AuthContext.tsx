
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, UserRole } from "../types/auth-types";
import { supabase } from "@/integrations/supabase/client";
import { loginUser, logoutUser } from "@/utils/authUtils";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Проверка сессии и инициализация состояния
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Установка слушателя изменений авторизации
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state change event:", event);
            if (event === "SIGNED_IN" && session) {
              fetchUserProfile(session.user.id);
            } else if (event === "SIGNED_OUT") {
              setAuth({
                isAuthenticated: false,
                user: null,
                isLoading: false,
              });
            }
          }
        );
        
        // Получение текущей сессии
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setAuth({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
        
        return () => {
          // Очистка слушателя при размонтировании
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuth({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };
    
    initAuth();
  }, []);
  
  // Получение профиля пользователя из базы данных
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", parseInt(userId, 10)) // Convert string userId to number
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        setAuth({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }
      
      if (profile) {
        console.log("User profile found:", profile);
        setAuth({
          isAuthenticated: true,
          user: {
            id: profile.id.toString(),
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            department: profile.department,
            position: profile.position,
            avatarUrl: profile.avatar_url
          },
          isLoading: false,
        });
      } else {
        console.error("No user profile found for ID:", userId);
        // Если профиль не найден, выходим из системы
        await supabase.auth.signOut();
        setAuth({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setAuth({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email);
      const { success, user, error } = await loginUser(email, password);

      if (!success || !user) {
        console.error("Login failed:", error);
        return false;
      }
      
      console.log("Login successful, user:", user);
      
      // Устанавливаем состояние пользователя вручную для немедленного отображения
      setAuth({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      // Немедленно обновляем состояние после выхода
      setAuth({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const hasPermission = (roles: UserRole[]): boolean => {
    if (!auth.isAuthenticated || !auth.user) return false;
    return roles.includes(auth.user.role);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
