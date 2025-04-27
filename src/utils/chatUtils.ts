
import { Message } from "@/types/chat-types";

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
