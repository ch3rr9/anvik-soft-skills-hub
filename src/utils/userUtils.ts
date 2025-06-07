
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
 * Получить все чаты пользователя
 */
export const getUserChats = async (userId: string): Promise<any[]> => {
  try {
    console.log('Getting chats for user:', userId);
    
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return [];
    }

    console.log('All chats from DB:', data);

    // Возвращаем все чаты - RLS политики уже фильтруют доступные чаты
    return data || [];
  } catch (error) {
    console.error("Error in getUserChats:", error);
    return [];
  }
};

/**
 * Создать или найти общий чат для всех пользователей - DEPRECATED
 * Используйте ensureGeneralChatExists из chatUtils
 */
export const ensureGeneralChatExists = async (): Promise<string | null> => {
  console.warn('ensureGeneralChatExists from userUtils is deprecated. Use the one from chatUtils instead.');
  return null;
};
