import { supabase } from "@/integrations/supabase/client";
import { UserProfile, UserRole } from "@/types/auth-types";

/**
 * Регистрация пользователя
 */
export const registerUser = async (
  email: string, 
  password: string, 
  userData: Omit<UserProfile, "id">
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Registering user:", email, userData);
    // Проверка, существует ли уже пользователь с таким email
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);
    
    if (checkError) {
      console.error("Error checking existing user:", checkError.message);
      return { success: false, error: checkError.message };
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists:", existingUsers);
      return { success: false, error: "Пользователь с таким email уже существует" };
    }
    
    // Генерация ID для пользователя
    const userId = Math.floor(1000000000 + Math.random() * 9000000000);
    
    // Создание профиля пользователя в таблице users
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        avatar_url: userData.avatarUrl,
        password: password
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return { success: false, error: profileError.message };
    }

    // Создание записи в Supabase Auth (опционально)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.warn("Non-critical Supabase Auth error:", authError.message);
        // Не возвращаем ошибку, так как пользователь уже создан в таблице users
      }
    } catch (authError) {
      console.warn("Auth registration non-critical error:", authError);
      // Продолжаем, так как пользователь уже создан в таблице users
    }

    console.log("User registered successfully with ID:", userId);
    return { success: true };
  } catch (error) {
    console.error("Error during registration:", error);
    return { success: false, error: "Произошла ошибка при регистрации" };
  }
};

/**
 * Авторизация пользователя
 */
export const loginUser = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
  try {
    console.log("Attempting login with email:", email);
    
    // Ищем пользователя в таблице users по email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    console.log("User query result:", userData, userError);

    if (userError) {
      console.error("Database query error:", userError.message);
      return { success: false, error: "Ошибка базы данных" };
    }
    
    if (!userData || userData.length === 0) {
      console.error("No user found with email:", email);
      return { success: false, error: "Неверный email или пароль" };
    }
    
    const user = userData[0];
    
    // Проверяем совпадени�� пароля
    if (user.password !== password) {
      console.error("Password mismatch for user:", email);
      return { success: false, error: "Неверный email или пароль" };
    }
    
    // Пользователь найден и пароль совпадает - пытаемся войти через Supabase Auth
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.warn("Supabase auth error (non-critical):", authError.message);
        // Продолжаем работу даже если Supabase Auth выдал ошибку
      }
    } catch (authError) {
      console.warn("Supabase auth exception (non-critical):", authError);
      // Продолжаем работу даже при ошибке
    }
    
    // Создаем профиль пользователя для возврата
    const userProfile: UserProfile = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      department: user.department || "",
      position: user.position || "",
      avatarUrl: user.avatar_url || ""
    };

    console.log("Login successful, returning user profile:", userProfile);
    return { success: true, user: userProfile };
  } catch (error) {
    console.error("Unexpected error during login:", error);
    return { success: false, error: "Произошла непредвиденная ошибка при входе" };
  }
};

/**
 * Выход пользователя
 */
export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // Проверяем сессию в Supabase Auth
    const { data: authData } = await supabase.auth.getSession();
    
    if (authData.session?.user) {
      // Если есть сессия, пытаемся получить пользователя по ID
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", parseInt(authData.session.user.id, 10))
        .maybeSingle();
      
      if (userData) {
        return {
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          department: userData.department || "",
          position: userData.position || "",
          avatarUrl: userData.avatar_url || ""
        };
      }
    }
    
    // Если нет сессии в Supabase Auth или пользователя в БД,
    // проверяем localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Создание демо-аккаунтов для разных ролей
 */
export const createDemoAccounts = async (): Promise<void> => {
  const demoAccounts = [
    {
      email: "director@anvik-soft.com",
      password: "director123",
      name: "Александр Директоров",
      role: "director" as UserRole,
      department: "Руководство",
      position: "Генеральный директор",
      avatarUrl: "https://i.pravatar.cc/150?u=director"
    },
    {
      email: "hr@anvik-soft.com",
      password: "hr123",
      name: "Елена Кадрова",
      role: "hr" as UserRole,
      department: "HR отдел",
      position: "HR менеджер",
      avatarUrl: "https://i.pravatar.cc/150?u=hr"
    },
    {
      email: "manager@anvik-soft.com",
      password: "manager123",
      name: "Михаил Управленцев",
      role: "manager" as UserRole,
      department: "Отдел разработки",
      position: "Руководитель проектов",
      avatarUrl: "https://i.pravatar.cc/150?u=manager"
    },
    {
      email: "employee@anvik-soft.com",
      password: "employee123",
      name: "Ирина Сотрудникова",
      role: "employee" as UserRole,
      department: "Отдел разработки",
      position: "Frontend разработчик",
      avatarUrl: "https://i.pravatar.cc/150?u=employee"
    }
  ];

  for (const account of demoAccounts) {
    const { email, password, ...userData } = account;
    
    // Исправлено: Явно добавляем email в userData, чтобы соответствовать типу Omit<UserProfile, "id">
    await registerUser(email, password, { ...userData, email });
  }
};
