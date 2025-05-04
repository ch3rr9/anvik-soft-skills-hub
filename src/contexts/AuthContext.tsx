
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

// User data (in a real application, this should be on the backend)
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
    // Check for JWT token on load
    const validateToken = async () => {
      const token = getStoredToken();
      
      if (token) {
        // Check if token has expired
        if (isTokenExpired(token)) {
          // If token has expired, remove it and set unauthenticated state
          removeToken();
          setAuth({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }
        
        // Verify token
        const decodedToken = await verifyToken(token);
        
        if (decodedToken) {
          // Find user based on token data
          const user = MOCK_USERS.find(u => u.id === decodedToken.userId);
          
          if (user) {
            // Remove password from user object before saving
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
      
      // If no token or token is invalid
      setAuth({ isAuthenticated: false, user: null, isLoading: false });
    };
    
    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Find user in mock data
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Remove password from user object before saving
      const { password: _, ...userWithoutPassword } = user;
      
      try {
        // Generate JWT token
        const token = await generateToken(userWithoutPassword);
        
        // Save token in localStorage
        storeToken(token);
        
        setAuth({
          isAuthenticated: true,
          user: userWithoutPassword,
          isLoading: false,
        });
        
        return true;
      } catch (error) {
        console.error("Error generating token:", error);
        return false;
      }
    }
    
    return false;
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
    
    // Remove JWT token
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
