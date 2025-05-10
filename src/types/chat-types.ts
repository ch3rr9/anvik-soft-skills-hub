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

// Add the Message type needed by MessageGroup.tsx
export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  chatId: string;
}

// Define types for the test results to show to director
export interface TestResultForDirector {
  id: number;
  user_id: number; // Changed from string to number to match our implementation
  user_name: string;
  user_position: string;
  test_id: number;
  test_name: string;
  score: number;
  max_score: number;
  passing_score: number;
  passed: boolean;
  created_at: string;
  viewed: boolean;
}
