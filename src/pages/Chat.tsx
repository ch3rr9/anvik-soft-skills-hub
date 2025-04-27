
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatRoom, Message } from "@/types/chat-types";
import { MOCK_CHATS, MOCK_MESSAGES } from "@/data/chatData";
import { groupMessagesByDate } from "@/utils/chatUtils";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageGroup from "@/components/chat/MessageGroup";
import MessageInput from "@/components/chat/MessageInput";

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHATS);
  
  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (selectedChat) {
      const chatMessages = MOCK_MESSAGES[selectedChat.id] || [];
      setMessages(chatMessages);
      
      // Обновляем счетчик непрочитанных
      setChatRooms(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [selectedChat]);
  
  // Add interval for message polling
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        const updatedMessages = MOCK_MESSAGES[selectedChat.id] || [];
        if (updatedMessages.length > messages.length) {
          setMessages(updatedMessages);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChat, messages.length]);
  
  // Отправка сообщения
  const sendMessage = (content: string) => {
    if (!selectedChat || !user) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: user.id,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages([...messages, newMessage]);
  };
  
  // Фильтрация чатов по поисковому запросу
  const filteredChatRooms = chatRooms.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Группированные сообщения
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      <ChatSidebar
        chatRooms={filteredChatRooms}
        selectedChat={selectedChat}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onChatSelect={setSelectedChat}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} />
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {groupedMessages.map((group, index) => (
                  <MessageGroup 
                    key={index} 
                    date={group.date} 
                    messages={group.messages} 
                  />
                ))}
              </div>
            </ScrollArea>
            
            <MessageInput onSendMessage={sendMessage} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Выберите чат</h3>
            <p className="text-muted-foreground">
              Выберите существующий чат или создайте новый, чтобы начать общение
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
