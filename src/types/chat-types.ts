
export interface Message {
  id: number;
  chatId: string; // Using string to match Supabase's chat_id field
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
  lastMessage?: Message;
  unreadCount: number;
  created_at?: string;
}
