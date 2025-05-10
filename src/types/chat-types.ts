
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

// Define types for the director_reports table
export interface DirectorReport {
  id: number;
  test_id: number;
  user_id: string;
  test_result_id: number;
  file_path: string;
  created_at: string;
  viewed: boolean;
}

// Add this interface for consistency with property naming in TestResultsViewer.tsx
export interface TestResultFile extends DirectorReport {
  testName?: string;
  userName?: string;
}
