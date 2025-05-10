
export interface ChatMessage {
  id: number;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: number;
  name: string;
  type: "direct" | "group";
  participants: string[];
  lastMessage: ChatMessage | null;
}

export interface FormattedMessage {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  isCurrentUser: boolean;
}

export interface MessageGroup {
  senderId: string;
  senderName: string;
  isCurrentUser: boolean;
  messages: FormattedMessage[];
}
