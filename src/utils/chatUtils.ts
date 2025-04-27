
import { Message, ChatRoom } from "@/types/chat-types";

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

// Функции для работы с локальным хранилищем сообщений
const STORAGE_KEY = 'anvik_chat_messages';

export const getAllMessages = (): Record<string, Message[]> => {
  const storedMessages = localStorage.getItem(STORAGE_KEY);
  if (storedMessages) {
    try {
      return JSON.parse(storedMessages);
    } catch (e) {
      console.error('Failed to parse stored messages', e);
      return {};
    }
  }
  return {};
};

export const getMessagesForChat = (chatId: string): Message[] => {
  const allMessages = getAllMessages();
  return allMessages[chatId] || [];
};

export const saveMessage = (message: Message): void => {
  const allMessages = getAllMessages();
  if (!allMessages[message.chatId]) {
    allMessages[message.chatId] = [];
  }
  
  // Проверяем, не дубликат ли это сообщение
  const isDuplicate = allMessages[message.chatId].some(
    msg => msg.id === message.id && msg.timestamp === message.timestamp
  );
  
  if (!isDuplicate) {
    allMessages[message.chatId].push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages));
  }
};

export const updateChatRoomsWithMessages = (chatRooms: ChatRoom[]): ChatRoom[] => {
  const allMessages = getAllMessages();
  
  return chatRooms.map(chat => {
    const chatMessages = allMessages[chat.id] || [];
    const sortedMessages = [...chatMessages].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const unreadCount = sortedMessages.filter(msg => !msg.read).length;
    const lastMessage = sortedMessages[0];
    
    return {
      ...chat,
      lastMessage,
      unreadCount
    };
  });
};
