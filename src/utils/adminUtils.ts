
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth-types";

/**
 * Создание нового пользователя-администратора
 */
export const createAdminUser = async (
  name: string,
  email: string,
  password: string,
  department: string = "Administration",
  position: string = "System Administrator"
): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    // Генерируем случайный ID для пользователя
    const userId = Math.floor(1000000000 + Math.random() * 9000000000);

    // Создание профиля пользователя в таблице users с ролью director
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: userId,
        name,
        email,
        role: "director" as UserRole, // Роль администратора с доступом ко всему
        department,
        position,
        password,
        avatar_url: `https://i.pravatar.cc/150?u=${email}`
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { success: false, error: profileError.message };
    }

    console.log("Admin user created successfully with ID:", userId);
    return { 
      success: true,
      id: userId.toString()
    };
  } catch (error) {
    console.error("Error during admin user creation:", error);
    return { success: false, error: "Произошла ошибка при создании пользователя" };
  }
};

/**
 * Создание пользователя Cherry
 */
export const createCherryUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Creating Cherry user...");
    
    // Проверяем, существует ли уже пользователь Cherry
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", "cherry@anvik-soft.com")
      .maybeSingle();

    if (existingUser) {
      console.log("Cherry user already exists");
      return { success: true };
    }

    // Создаём пользователя Cherry
    const { error } = await supabase
      .from("users")
      .insert({
        id: 1000000005,
        name: "Cherry",
        email: "cherry@anvik-soft.com",
        role: "director",
        department: "Administration",
        position: "System Administrator",
        password: "cherry999",
        avatar_url: "https://i.pravatar.cc/150?u=cherry"
      });

    if (error) {
      console.error("Error creating Cherry user:", error);
      return { success: false, error: error.message };
    }

    console.log("Cherry user created successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in createCherryUser:", error);
    return { success: false, error: "Произошла ошибка при создании пользователя Cherry" };
  }
};
