
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
    // Регистрация пользователя через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error("No user created");
      return { success: false, error: "Не удалось создать пользователя" };
    }

    // Создание профиля пользователя в таблице users с ролью director
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: parseInt(authData.user.id, 10), // Преобразуем UUID в число
        name,
        email,
        role: "director" as UserRole, // Роль администратора
        department,
        position,
        password, // Добавляем пароль в новый столбец
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      
      // Попытка удалить созданного пользователя, если профиль не создался
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return { success: false, error: profileError.message };
    }

    return { 
      success: true,
      id: authData.user.id
    };
  } catch (error) {
    console.error("Error during admin user creation:", error);
    return { success: false, error: "Произошла ошибка при создании пользователя" };
  }
};
