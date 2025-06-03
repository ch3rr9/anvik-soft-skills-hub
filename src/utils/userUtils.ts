
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth-types";

/**
 * Получить всех пользователей системы
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data.map(user => ({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role as any,
      department: user.department || undefined,
      position: user.position || undefined,
      avatarUrl: user.avatar_url || undefined
    }));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
};

/**
 * Получить пользователя по ID
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }

    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      role: data.role as any,
      department: data.department || undefined,
      position: data.position || undefined,
      avatarUrl: data.avatar_url || undefined
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

/**
 * Проверить, создан ли общий чат
 */
export const ensureGeneralChatExists = async (): Promise<void> => {
  try {
    // Проверяем, есть ли уже общий чат
    const { data: existingChat } = await supabase
      .from("chats")
      .select("id")
      .eq("name", "Общий чат")
      .eq("type", "group")
      .single();

    if (existingChat) {
      return; // Общий чат уже существует
    }

    // Получаем всех пользователей
    const allUsers = await getAllUsers();
    const participantIds = allUsers.map(user => Number(user.id));

    // Создаем общий чат
    const { error } = await supabase
      .from("chats")
      .insert([{
        name: "Общий чат",
        type: "group",
        participants: participantIds
      }]);

    if (error) {
      console.error("Error creating general chat:", error);
    } else {
      console.log("General chat created successfully");
    }
  } catch (error) {
    console.error("Error in ensureGeneralChatExists:", error);
  }
};
