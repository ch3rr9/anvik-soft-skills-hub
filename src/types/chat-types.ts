
export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}
