
import { Message, ChatRoom } from "@/types/chat-types";
import { supabase } from "@/integrations/supabase/client";

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
  
  return data || [];
};

export const getMessagesForChat = async (chatId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true });
    
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data || [];
};

export const saveMessage = async (message: Message): Promise<Message | null> => {
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
  const { error: updateError } = await supabase.rpc('increment_unread_count', { 
    chat_id: message.chatId
  });
  
  if (updateError) {
    console.error('Error updating unread count:', updateError);
  }
  
  return data;
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', chatId)
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

export const updateChatRoomsWithMessages = async (chatRooms: ChatRoom[]): Promise<ChatRoom[]> => {
  const chatsWithMessages = await Promise.all(
    chatRooms.map(async (chat) => {
      const messages = await getMessagesForChat(chat.id);
      
      if (messages.length === 0) {
        return chat;
      }
      
      // Сортировка по времени (новые первыми)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      
      return {
        ...chat,
        lastMessage,
      };
    })
  );
  
  return chatsWithMessages;
};
