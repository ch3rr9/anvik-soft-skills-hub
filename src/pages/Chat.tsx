import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatRoom, Message } from "@/types/chat-types";
import { supabase } from "@/integrations/supabase/client";
import { 
  groupMessagesByDate, 
  getMessagesForChat, 
  saveMessage, 
  updateChatRoomsWithMessages,
  markMessagesAsRead
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
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Загрузка чатов при монтировании компонента
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const { data: chats, error } = await supabase
          .from('chats')
          .select('*');
          
        if (error) {
          console.error('Error fetching chats:', error);
          toast({ 
            title: "Ошибка загрузки", 
            description: "Не удалось загрузить чаты", 
            variant: "destructive" 
          });
          return;
        }
        
        if (chats) {
          const updatedChats = await updateChatRoomsWithMessages(chats);
          setChatRooms(updatedChats);
        }
      } catch (e) {
        console.error('Error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
    
    // Подписка на обновления чатов
    const chatsSubscription = supabase
      .channel('chats_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chats' },
        (payload) => { fetchChats(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(chatsSubscription);
    };
  }, []);
  
  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (selectedChat && user) {
      const fetchMessages = async () => {
        const chatMessages = await getMessagesForChat(selectedChat.id);
        setMessages(chatMessages);
        
        // Отметить сообщения как прочитанные
        await markMessagesAsRead(selectedChat.id, user.id);
      };
      
      fetchMessages();
      
      // Подписка на новые сообщения в выбранном чате
      const messagesSubscription = supabase
        .channel(`messages_${selectedChat.id}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${String(selectedChat.id)}` },
          (payload) => {
            const newMessageData = payload.new as any;
            
            // Преобразуем новое сообщение к нашему формату
            const newMessage: Message = {
              id: newMessageData.id,
              chatId: newMessageData.chat_id,
              senderId: newMessageData.sender_id,
              senderName: newMessageData.sender_name,
              content: newMessageData.content,
              timestamp: newMessageData.timestamp,
              read: newMessageData.read
            };
            
            // Добавляем новое сообщение в стейт
            setMessages(prev => [...prev, newMessage]);
            
            // Если сообщение от другого пользователя, отмечаем как прочитанное
            if (newMessage.senderId !== user.id) {
              markMessagesAsRead(selectedChat.id, user.id);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [selectedChat, user]);
  
  // Отправка сообщения
  const sendMessage = async (content: string) => {
    if (!selectedChat || !user) return;
    
    const newMessage: Omit<Message, "id"> = {
      chatId: String(selectedChat.id), // Convert number to string to match the type
      senderId: user.id,
      senderName: user.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    const savedMessage = await saveMessage(newMessage);
    
    if (savedMessage) {
      toast({
        title: "Сообщение отправлено",
        description: `В чат "${selectedChat.name}"`,
      });
    } else {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
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
        isLoading={isLoading}
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
