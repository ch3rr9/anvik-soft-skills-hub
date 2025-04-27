
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatRoom, Message } from "@/types/chat-types";
import { MOCK_CHATS } from "@/data/chatData";
import { 
  groupMessagesByDate, 
  getMessagesForChat, 
  saveMessage, 
  updateChatRoomsWithMessages 
} from "@/utils/chatUtils";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageGroup from "@/components/chat/MessageGroup";
import MessageInput from "@/components/chat/MessageInput";
import { toast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHATS);
  
  // Инициализация при загрузке компонента
  useEffect(() => {
    // Обновляем чаты с учетом сохраненных сообщений
    const updatedChatRooms = updateChatRoomsWithMessages(MOCK_CHATS);
    setChatRooms(updatedChatRooms);
  }, []);
  
  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (selectedChat) {
      // Получаем сообщения из localStorage
      const chatMessages = getMessagesForChat(selectedChat.id);
      setMessages(chatMessages);
      
      // Обновляем счетчик непрочитанных
      setChatRooms(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [selectedChat]);
  
  // Периодическая проверка новых сообщений
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChat) {
        const updatedMessages = getMessagesForChat(selectedChat.id);
        // Проверка на новые сообщения
        if (JSON.stringify(updatedMessages) !== JSON.stringify(messages)) {
          setMessages(updatedMessages);
        }
      }
      
      // Обновляем все чаты с учетом новых сообщений
      const updatedChatRooms = updateChatRoomsWithMessages(MOCK_CHATS);
      setChatRooms(updatedChatRooms);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedChat, messages]);
  
  // Отправка сообщения
  const sendMessage = (content: string) => {
    if (!selectedChat || !user) return;
    
    const existingMessages = getMessagesForChat(selectedChat.id);
    const newId = existingMessages.length > 0 
      ? Math.max(...existingMessages.map(m => m.id)) + 1 
      : 1;
    
    const newMessage: Message = {
      id: newId,
      senderId: user.id,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      chatId: selectedChat.id,
    };
    
    // Сохраняем в localStorage и обновляем UI
    saveMessage(newMessage);
    
    // Обновляем локальное состояние сообщений
    setMessages([...messages, newMessage]);
    
    toast({
      title: "Сообщение отправлено",
      description: `В чат "${selectedChat.name}"`,
    });
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
