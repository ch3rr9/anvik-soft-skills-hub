
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
      id: user.id.toString(),
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
      .eq("id", parseInt(userId))
      .single();

    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }

    return {
      id: data.id.toString(),
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
 * Создать или найти общий чат для всех пользователей
 */
export const ensureGeneralChatExists = async (): Promise<string | null> => {
  try {
    // Проверяем, есть ли уже общий чат
    const { data: existingChat } = await supabase
      .from("chats")
      .select("id")
      .eq("name", "Общий чат")
      .eq("type", "group")
      .single();

    if (existingChat) {
      return existingChat.id.toString();
    }

    // Получаем всех пользователей для добавления в общий чат
    const allUsers = await getAllUsers();
    const participants = allUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    // Создаем общий чат
    const { data: newChat, error } = await supabase
      .from("chats")
      .insert({
        name: "Общий чат",
        type: "group",
        participants: participants
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating general chat:", error);
      return null;
    }

    console.log("General chat created successfully");
    return newChat.id.toString();
  } catch (error) {
    console.error("Error in ensureGeneralChatExists:", error);
    return null;
  }
};

/**
 * Получить все чаты пользователя
 */
export const getUserChats = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return [];
    }

    // Фильтруем чаты, в которых участвует пользователь
    const userChats = data.filter(chat => {
      const participants = chat.participants as any[];
      return participants.some(p => p.id === userId) || chat.type === "group";
    });

    return userChats;
  } catch (error) {
    console.error("Error in getUserChats:", error);
    return [];
  }
};
