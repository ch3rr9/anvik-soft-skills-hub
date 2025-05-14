
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, UserRole } from "../types/auth-types";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
      // Установка слушателя изменений авторизации
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
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
    };
    
    initAuth();
  }, []);
  
  // Получение профиля пользователя из базы данных
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", parseInt(userId, 10)) // Convert string userId to number
        .single();
      
      if (profile) {
        console.log("User profile found:", profile);
        setAuth({
          isAuthenticated: true,
          user: {
            id: profile.id.toString(), // Convert number back to string for consistency
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
        supabase.auth.signOut();
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      
      console.log("Login successful");
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
