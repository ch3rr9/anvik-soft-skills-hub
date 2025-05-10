
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ChatRoom, Message } from "@/types/chat-types";
import { UserProfile } from "@/types/auth-types";

/**
 * Format message timestamp for display
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Group messages by date for display
 */
export const groupMessagesByDate = (messages: Message[]): { date: string, messages: Message[] }[] => {
  const groups: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleDateString();
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(message);
  });
  
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }));
};

/**
 * Загрузка списка чатов для текущего пользователя
 */
export const loadUserChats = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .filter("participants", "cs", `["${userId}"]`);

    if (error) {
      console.error("Error loading chats:", error);
      return [];
    }

    const chats: ChatRoom[] = await Promise.all(
      data.map(async (chat) => {
        // Получение последнего сообщения для чата
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", String(chat.id))
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage = messagesData && messagesData.length > 0 
          ? {
              id: messagesData[0].id,
              chatId: messagesData[0].chat_id,
              content: messagesData[0].content,
              senderId: messagesData[0].sender_id,
              senderName: messagesData[0].sender_name,
              timestamp: messagesData[0].timestamp,
              read: messagesData[0].read
            }
          : null;

        return {
          id: chat.id,
          name: chat.name,
          type: chat.type as "direct" | "group",
          participants: chat.participants as string[],
          lastMessage
        };
      })
    );

    return chats;
  } catch (error) {
    console.error("Error in loadUserChats:", error);
    return [];
  }
};

/**
 * Загрузка сообщений для конкретного чата
 */
export const loadChatMessages = async (chatId: number | string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", String(chatId))
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      chatId: msg.chat_id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      timestamp: msg.timestamp,
      read: msg.read
    }));
  } catch (error) {
    console.error("Error in loadChatMessages:", error);
    return [];
  }
};

/**
 * Get messages for specific chat
 */
export const getMessagesForChat = async (chatId: number): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", String(chatId))
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("Error getting messages:", error);
      return [];
    }
    
    return data.map(msg => ({
      id: msg.id,
      chatId: msg.chat_id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      timestamp: msg.timestamp,
      read: msg.read
    }));
  } catch (error) {
    console.error("Error in getMessagesForChat:", error);
    return [];
  }
};

/**
 * Save a new message
 */
export const saveMessage = async (message: Omit<Message, "id">): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([{
        chat_id: message.chatId,
        content: message.content,
        sender_id: message.senderId,
        sender_name: message.senderName,
        timestamp: message.timestamp,
        read: message.read
      }])
      .select();
      
    if (error || !data || data.length === 0) {
      console.error("Error saving message:", error);
      return null;
    }
    
    return {
      id: data[0].id,
      chatId: data[0].chat_id,
      content: data[0].content,
      senderId: data[0].sender_id,
      senderName: data[0].sender_name,
      timestamp: data[0].timestamp,
      read: data[0].read
    };
  } catch (error) {
    console.error("Error in saveMessage:", error);
    return null;
  }
};

/**
 * Update chat rooms with latest messages
 */
export const updateChatRoomsWithMessages = async (chats: any[]): Promise<ChatRoom[]> => {
  try {
    return await Promise.all(chats.map(async (chat) => {
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", String(chat.id))
        .order("created_at", { ascending: false })
        .limit(1);
      
      const lastMessage = messagesData && messagesData.length > 0 
        ? {
            id: messagesData[0].id,
            chatId: messagesData[0].chat_id,
            content: messagesData[0].content,
            senderId: messagesData[0].sender_id,
            senderName: messagesData[0].sender_name,
            timestamp: messagesData[0].timestamp,
            read: messagesData[0].read
          }
        : null;
      
      return {
        id: chat.id,
        name: chat.name,
        type: chat.type as "direct" | "group",
        participants: chat.participants as string[],
        lastMessage
      };
    }));
  } catch (error) {
    console.error("Error updating chat rooms:", error);
    return [];
  }
};

/**
 * Отправка нового сообщения в чат
 */
export const sendMessage = async (
  chatId: number | string,
  content: string,
  user: UserProfile
): Promise<ChatMessage | null> => {
  try {
    const newMessage = {
      chat_id: String(chatId),
      content,
      sender_id: user.id,
      sender_name: user.name,
      timestamp: new Date().toISOString(),
      read: false
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([newMessage])
      .select();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return {
      id: data[0].id,
      chatId: data[0].chat_id,
      content: data[0].content,
      senderId: data[0].sender_id,
      senderName: data[0].sender_name,
      timestamp: data[0].timestamp,
      read: data[0].read
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return null;
  }
};

/**
 * Создание нового чата
 */
export const createChat = async (
  name: string,
  participants: string[],
  type: "direct" | "group" = "direct"
): Promise<ChatRoom | null> => {
  try {
    const newChat = {
      name,
      participants,
      type
    };

    const { data, error } = await supabase
      .from("chats")
      .insert([newChat])
      .select();

    if (error) {
      console.error("Error creating chat:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return {
      id: data[0].id,
      name: data[0].name,
      type: data[0].type as "direct" | "group",
      participants: data[0].participants as string[],
      lastMessage: null
    };
  } catch (error) {
    console.error("Error in createChat:", error);
    return null;
  }
};

/**
 * Отметить сообщения как прочитанные
 */
export const markMessagesAsRead = async (chatId: number | string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("chat_id", String(chatId))
      .neq("sender_id", userId);

    if (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return false;
  }
};
