
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, UserRole } from "../types/auth-types";
import { supabase } from "@/integrations/supabase/client";
import { loginUser, logoutUser } from "@/utils/authUtils";
import { toast } from "@/hooks/use-toast";

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
        console.log("Initializing auth...");
        
        // Проверка наличия пользователя в localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Found stored user:", parsedUser);
            setAuth({
              isAuthenticated: true,
              user: parsedUser,
              isLoading: false,
            });
            return;
          } catch (e) {
            console.error("Error parsing stored user:", e);
            localStorage.removeItem("user");
          }
        }
        
        // Если пользователь не найден в localStorage, пытаемся получить сессию через Supabase
        console.log("Checking for Supabase session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Found Supabase session, fetching user profile...");
          await fetchUserProfile(session.user.id);
        } else {
          console.log("No active session found");
          setAuth({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
        
        // Установка слушателя изменений авторизации
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state change event:", event);
            if (event === "SIGNED_IN" && session) {
              fetchUserProfile(session.user.id);
            } else if (event === "SIGNED_OUT") {
              localStorage.removeItem("user");
              setAuth({
                isAuthenticated: false,
                user: null,
                isLoading: false,
              });
            }
          }
        );
        
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
        .eq("id", parseInt(userId, 10))
        .limit(1);
      
      if (error) {
        console.error("Error fetching profile:", error);
        setAuth({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }
      
      if (profile && profile.length > 0) {
        const user = profile[0];
        console.log("User profile found:", user);
        
        const userProfile: UserProfile = {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          department: user.department,
          position: user.position,
          avatarUrl: user.avatar_url
        };
        
        // Сохраняем пользователя в localStorage
        localStorage.setItem("user", JSON.stringify(userProfile));
        
        setAuth({
          isAuthenticated: true,
          user: userProfile,
          isLoading: false,
        });
      } else {
        console.error("No user profile found for ID:", userId);
        localStorage.removeItem("user");
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
      setAuth(prev => ({ ...prev, isLoading: true }));
      console.log("Attempting login for:", email);
      
      const { success, user, error } = await loginUser(email, password);

      if (!success || !user) {
        console.error("Login failed:", error);
        toast({
          title: "Ошибка входа",
          description: error || "Неверный email или пароль",
          variant: "destructive",
        });
        setAuth(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      console.log("Login successful, user:", user);
      
      // Сохраняем пользователя в localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      // Устанавливаем состояние пользователя вручную для немедленного отображения
      setAuth({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
      
      toast({
        title: "Вход выполнен",
        description: `Добро пожаловать, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Ошибка входа",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive",
      });
      setAuth(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true }));
      await logoutUser();
      // Удаляем пользователя из localStorage
      localStorage.removeItem("user");
      // Немедленно обновляем состояние после выхода
      setAuth({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из системы",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      setAuth(prev => ({ ...prev, isLoading: false }));
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
