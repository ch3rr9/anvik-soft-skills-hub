
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Plus } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserChats, ensureGeneralChatExists } from "@/utils/userUtils";
import QuickMessageDialog from "@/components/chat/QuickMessageDialog";

interface Message {
  id: number;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: number;
  name: string;
  type: string;
  participants: any[];
  created_at: string;
}

const Chat = () => {
  const { user } = useSimpleAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      initializeChats();
    }
  }, [user]);

  const initializeChats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Убеждаемся, что общий чат существует
      await ensureGeneralChatExists();
      
      // Загружаем все чаты пользователя
      const userChats = await getUserChats(user.id);
      setChats(userChats);

      // Автоматически выбираем общий чат, если он есть
      const generalChat = userChats.find(chat => chat.name === "Общий чат");
      if (generalChat) {
        setSelectedChat(generalChat);
        loadMessages(generalChat.id.toString());
      }
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

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
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
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id.toString(),
          sender_id: user.id,
          sender_name: user.name,
          content: newMessage.trim()
        });

      if (error) {
        throw error;
      }

      setNewMessage("");
      // Перезагружаем сообщения
      loadMessages(selectedChat.id.toString());
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    loadMessages(chat.id.toString());
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name && chat.name !== "") {
      return chat.name;
    }

    if (chat.type === "direct" && user) {
      const otherParticipant = chat.participants.find(p => p.id !== user.id);
      return otherParticipant ? otherParticipant.name : "Неизвестный пользователь";
    }

    return "Групповой чат";
  };

  const handleChatCreated = (chatId: string) => {
    // Перезагружаем список чатов после создания нового
    initializeChats();
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
        <h1 className="text-2xl font-bold">Чаты и сообщения</h1>
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
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.sender_id !== user?.id && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.sender_name}
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
