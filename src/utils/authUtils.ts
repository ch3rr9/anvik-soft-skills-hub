
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
    // Регистрация пользователя через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Не удалось создать пользователя" };
    }

    // Создание профиля пользователя в таблице users
    // Supabase Auth использует UUID (строка), а таблица users использует числовые ID
    // Поэтому нам нужно конвертировать строковый UUID в число
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: parseInt(authData.user.id, 10), // Convert UUID string to number for the users table
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        avatar_url: userData.avatarUrl
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      return { success: false, error: profileError.message };
    }

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
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: "Произошла ошибка при входе" };
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
  const { data: authData } = await supabase.auth.getSession();
  
  if (!authData.session?.user) {
    return null;
  }
  
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", parseInt(authData.session.user.id, 10)) // Convert string to number for the query
    .single();
  
  if (!userData) {
    return null;
  }
  
  return {
    id: userData.id.toString(), // Convert number back to string for consistency in our app
    name: userData.name,
    email: userData.email,
    role: userData.role as UserRole,
    department: userData.department,
    position: userData.position,
    avatarUrl: userData.avatar_url
  };
};
