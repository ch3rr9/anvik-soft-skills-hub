
import { Message, ChatRoom } from "@/types/chat-types";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMessageDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Сегодня";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Вчера";
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  }
};

export const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = [];
  
  messages.forEach(message => {
    const messageDate = formatMessageDate(message.timestamp);
    const existingGroup = groups.find(group => group.date === messageDate);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date: messageDate, messages: [message] });
    }
  });
  
  return groups;
};

// Функции для работы с чатами из Supabase
export const getAllChats = async (): Promise<ChatRoom[]> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*');
    
  if (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
  
  return data?.map(chat => ({
    id: chat.id,
    name: chat.name,
    type: chat.type as "direct" | "group",
    participants: chat.participants as string[],
    unreadCount: chat.unread_count,
    created_at: chat.created_at
  })) || [];
};

export const getMessagesForChat = async (chatId: number): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', String(chatId))
    .order('timestamp', { ascending: true });
    
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data?.map(msg => ({
    id: msg.id,
    chatId: msg.chat_id,
    senderId: msg.sender_id,
    senderName: msg.sender_name,
    content: msg.content,
    timestamp: msg.timestamp,
    read: msg.read
  })) || [];
};

export const saveMessage = async (message: Omit<Message, "id">): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { 
        chat_id: message.chatId,
        sender_id: message.senderId,
        sender_name: message.senderName,
        content: message.content,
        timestamp: message.timestamp,
        read: message.read
      }
    ])
    .select()
    .single();
    
  if (error) {
    console.error('Error saving message:', error);
    return null;
  }
  
  // Обновление счетчика непрочитанных сообщений
  // Convert the chatId to a number since the RPC function expects a number
  const chatIdNumber = parseInt(message.chatId, 10);
  
  // Используем корректную типизацию для аргумента chat_id
  const { error: updateError } = await supabase.rpc('increment_unread_count', { 
    chat_id: chatIdNumber
  });
  
  if (updateError) {
    console.error('Error updating unread count:', updateError);
  }
  
  return {
    id: data.id,
    chatId: data.chat_id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    content: data.content,
    timestamp: data.timestamp,
    read: data.read
  };
};

export const markMessagesAsRead = async (chatId: number, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', String(chatId))
    .neq('sender_id', userId);
    
  if (error) {
    console.error('Error marking messages as read:', error);
  }
  
  // Сброс счетчика непрочитанных сообщений
  const { error: updateError } = await supabase
    .from('chats')
    .update({ unread_count: 0 })
    .eq('id', chatId);
    
  if (updateError) {
    console.error('Error resetting unread count:', updateError);
  }
};

export const updateChatRoomsWithMessages = async (chats: any[]): Promise<ChatRoom[]> => {
  const chatsWithMessages = await Promise.all(
    chats.map(async (chat) => {
      const messages = await getMessagesForChat(chat.id);
      
      if (messages.length === 0) {
        return {
          id: chat.id,
          name: chat.name,
          type: chat.type as "direct" | "group",
          participants: chat.participants as string[],
          unreadCount: chat.unread_count,
          created_at: chat.created_at
        };
      }
      
      // Сортировка по времени (новые первыми)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      
      return {
        id: chat.id,
        name: chat.name,
        type: chat.type as "direct" | "group",
        participants: chat.participants as string[],
        unreadCount: chat.unread_count,
        lastMessage,
        created_at: chat.created_at
      };
    })
  );
  
  return chatsWithMessages;
};
