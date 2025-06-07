
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { getAllUsers } from "@/utils/userUtils";
import { UserProfile } from "@/types/auth-types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface QuickMessageDialogProps {
  onChatCreated?: (chatId: string) => void;
}

const QuickMessageDialog: React.FC<QuickMessageDialogProps> = ({ onChatCreated }) => {
  const { user } = useSimpleAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers();
      // Исключаем текущего пользователя из списка
      const otherUsers = allUsers.filter(u => u.id !== user?.id);
      setUsers(otherUsers);
    };

    if (isOpen && user) {
      fetchUsers();
    }
  }, [isOpen, user]);

  const handleSendMessage = async () => {
    if (!user || !selectedUserId || !message.trim()) return;

    setIsLoading(true);
    try {
      const selectedUser = users.find(u => u.id === selectedUserId);
      if (!selectedUser) return;

      // Проверяем, существует ли уже чат между этими пользователями
      const { data: existingChats } = await supabase
        .from('chats')
        .select('*')
        .eq('type', 'direct');

      let chatId: string | null = null;

      if (existingChats) {
        // Ищем существующий приватный чат между пользователями
        const existingChat = existingChats.find(chat => {
          const participants = chat.participants as any[];
          return participants.length === 2 &&
            participants.some(p => p.id === user.id) &&
            participants.some(p => p.id === selectedUserId);
        });

        if (existingChat) {
          chatId = existingChat.id.toString();
        }
      }

      // Если чат не существует, создаем новый
      if (!chatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            name: "",
            type: "direct",
            participants: [
              { id: user.id, name: user.name, email: user.email },
              { id: selectedUserId, name: selectedUser.name, email: selectedUser.email }
            ]
          })
          .select()
          .single();

        if (chatError) {
          throw chatError;
        }

        chatId = newChat.id.toString();
      }

      // Отправляем сообщение
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          sender_name: user.name,
          content: message.trim()
        });

      if (messageError) {
        throw messageError;
      }

      toast({
        title: "Сообщение отправлено",
        description: `Ваше сообщение отправлено пользователю ${selectedUser.name}`,
      });

      // Сбрасываем форму и закрываем диалог
      setMessage("");
      setSelectedUserId("");
      setIsOpen(false);

      // Уведомляем родительский компонент о создании чата
      if (onChatCreated) {
        onChatCreated(chatId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-2" />
          Написать сообщение
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Отправить личное сообщение</DialogTitle>
          <DialogDescription>
            Выберите получателя и напишите сообщение
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Получатель:</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пользователя" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Сообщение:</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите ваше сообщение..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!selectedUserId || !message.trim() || isLoading}
            >
              {isLoading ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickMessageDialog;
