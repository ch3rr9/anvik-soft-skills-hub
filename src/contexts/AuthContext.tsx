
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, UserProfile, UserRole } from "../types/auth-types";
import { 
  generateToken, 
  verifyToken, 
  storeToken, 
  removeToken, 
  getStoredToken,
  isTokenExpired
} from "../utils/jwtUtils";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Данные пользователей (в реальном приложении должны быть на бэкенде)
const MOCK_USERS = [
  {
    id: "1",
    name: "Иван Директоров",
    email: "director@anvik-soft.com",
    password: "director123",
    role: "director" as UserRole,
    department: "Руководство",
    position: "Директор",
    avatarUrl: "",
  },
  {
    id: "2",
    name: "Мария Кадрова",
    email: "hr@anvik-soft.com",
    password: "hr123",
    role: "manager" as UserRole,
    department: "HR",
    position: "Менеджер по персоналу",
    avatarUrl: "",
  },
  {
    id: "3",
    name: "Алексей Программистов",
    email: "employee@anvik-soft.com",
    password: "employee123",
    role: "employee" as UserRole,
    department: "Разработка",
    position: "1С Разработчик",
    avatarUrl: "",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Проверяем наличие JWT токена при загрузке
    const token = getStoredToken();
    
    if (token) {
      // Проверяем срок действия токена
      if (isTokenExpired(token)) {
        // Если токен истек, удаляем его и устанавливаем неаутентифицированное состояние
        removeToken();
        setAuth({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
      
      // Верифицируем токен
      const decodedToken = verifyToken(token);
      
      if (decodedToken) {
        // Находим пользователя по данным из токена
        const user = MOCK_USERS.find(u => u.id === decodedToken.userId);
        
        if (user) {
          // Убираем пароль из объекта пользователя перед сохранением
          const { password: _, ...userWithoutPassword } = user;
          
          setAuth({
            isAuthenticated: true,
            user: userWithoutPassword,
            isLoading: false,
          });
          return;
        }
      }
    }
    
    // Если нет токена или он недействителен
    setAuth({ isAuthenticated: false, user: null, isLoading: false });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Имитация задержки сети
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Поиск пользователя в моковых данных
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Убираем пароль из объекта пользователя перед сохранением
      const { password: _, ...userWithoutPassword } = user;
      
      // Генерируем JWT токен
      const token = generateToken(userWithoutPassword);
      
      // Сохраняем токен в localStorage
      storeToken(token);
      
      setAuth({
        isAuthenticated: true,
        user: userWithoutPassword,
        isLoading: false,
      });
      
      // Больше не сохраняем объект пользователя в localStorage,
      // так как теперь восстанавливаем данные из JWT
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    
    // Удаляем JWT токен
    removeToken();
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
