
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, Wifi, WifiOff } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadUserChats, ensureGeneralChatExists, loadChatMessages, sendMessage } from "@/utils/chatUtils";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { ChatMessage, ChatRoom, Message } from "@/types/chat-types";
import QuickMessageDialog from "@/components/chat/QuickMessageDialog";

const Chat = () => {
  const { user } = useSimpleAuth();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Real-time синхронизация
  const { isConnected } = useRealtimeChat(
    user?.id,
    (updatedChats) => {
      console.log('Chats updated via realtime');
      loadChats();
    },
    (chatId, message) => {
      console.log('New message via realtime:', message);
      // Если это текущий чат, добавляем сообщение
      if (selectedChat && selectedChat.id.toString() === chatId) {
        const newChatMessage: ChatMessage = {
          id: message.id,
          chatId: message.chatId,
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          timestamp: message.timestamp,
          read: message.read
        };
        setMessages(prev => [...prev, newChatMessage]);
      }
      // Обновляем список чатов чтобы показать последнее сообщение
      loadChats();
    }
  );

  const loadChats = async () => {
    if (!user) return;

    try {
      console.log('Loading chats for user:', user.id);
      const userChats = await loadUserChats(user.id);
      console.log('Loaded chats:', userChats);
      setChats(userChats);

      // Автоматически выбираем общий чат, если он есть
      const generalChat = userChats.find(chat => chat.name === "Общий чат");
      if (generalChat && !selectedChat) {
        setSelectedChat(generalChat);
        loadMessages(generalChat.id.toString());
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Ошибка загрузки чатов",
        description: "Не удалось загрузить список чатов",
        variant: "destructive"
      });
    }
  };

  const initializeChats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Initializing chats...');
      
      // Убеждаемся, что общий чат существует
      await ensureGeneralChatExists();
      
      // Загружаем все чаты пользователя
      await loadChats();
    } catch (error) {
      console.error('Error initializing chats:', error);
      toast({
        title: "Ошибка загрузки чатов",
        description: "Не удалось загрузить список чатов",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      initializeChats();
    }
  }, [user]);

  // Слушаем события обновления чатов
  useEffect(() => {
    const handleChatUpdate = () => {
      console.log('Chat update event received');
      loadChats();
    };

    window.addEventListener('chat-updated', handleChatUpdate);
    
    return () => {
      window.removeEventListener('chat-updated', handleChatUpdate);
    };
  }, [user]);

  const loadMessages = async (chatId: string) => {
    try {
      console.log('Loading messages for chat:', chatId);
      const chatMessages = await loadChatMessages(chatId);
      console.log('Loaded messages:', chatMessages);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Ошибка загрузки сообщений",
        description: "Не удалось загрузить сообщения",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    try {
      const sentMessage = await sendMessage(selectedChat.id, newMessage.trim(), user);

      if (sentMessage) {
        setNewMessage("");
        // Сообщение будет добавлено через real-time подписку
        // Но на всякий случай обновляем локально тоже
        setMessages(prev => [...prev, sentMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };

  const handleSelectChat = (chat: ChatRoom) => {
    console.log('Selecting chat:', chat);
    setSelectedChat(chat);
    loadMessages(chat.id.toString());
  };

  const getChatDisplayName = (chat: ChatRoom) => {
    if (chat.name && chat.name !== "") {
      return chat.name;
    }

    if (chat.type === "direct" && user) {
      // For direct chats, find the other participant (participants is string[])
      const otherParticipantId = chat.participants.find(participantId => participantId !== user.id);
      return otherParticipantId ? `Пользователь ${otherParticipantId}` : "Неизвестный пользователь";
    }

    return "Групповой чат";
  };

  const handleChatCreated = () => {
    console.log('Chat created, reloading chats...');
    loadChats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">Чаты и сообщения</h1>
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Подключено" : "Отключено"}
            </span>
          </div>
        </div>
        <QuickMessageDialog onChatCreated={handleChatCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Список чатов */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Чаты</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getChatDisplayName(chat).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getChatDisplayName(chat)}
                        </p>
                        <p className="text-sm opacity-70">
                          {chat.type === "group" ? "Групповой чат" : "Личный чат"}
                        </p>
                      </div>
                      {chat.type === "group" && (
                        <Badge variant="secondary" className="text-xs">
                          {chat.participants.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Окно чата */}
        <Card className="md:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader>
                <CardTitle>{getChatDisplayName(selectedChat)}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Сообщения */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.senderId !== user?.id && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.senderName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Ввод сообщения */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Выберите чат для начала общения</p>
                <QuickMessageDialog onChatCreated={handleChatCreated} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
