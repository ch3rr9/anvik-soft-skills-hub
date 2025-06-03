
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, User } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";
import { getAllUsers } from "@/utils/userUtils";
import { createChat } from "@/utils/chatUtils";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types/auth-types";

interface CreateChatDialogProps {
  onChatCreated: () => void;
}

const CreateChatDialog = ({ onChatCreated }: CreateChatDialogProps) => {
  const { user } = useSimpleAuth();
  const [open, setOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatType, setChatType] = useState<"direct" | "group">("group");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      const users = await getAllUsers();
      setAllUsers(users.filter(u => u.id !== user?.id)); // Исключаем текущего пользователя
    };
    
    if (open) {
      loadUsers();
    }
  }, [open, user?.id]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = async () => {
    if (!chatName.trim() || !user) {
      toast({
        title: "Ошибка",
        description: "Введите название чата",
        variant: "destructive"
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Ошибка", 
        description: "Выберите хотя бы одного участника",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const participants = [...selectedUsers, user.id];
    const newChat = await createChat(chatName, participants, chatType);
    
    if (newChat) {
      toast({
        title: "Чат создан",
        description: `Чат "${chatName}" успешно создан`,
      });
      setOpen(false);
      setChatName("");
      setSelectedUsers([]);
      onChatCreated();
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось создать чат",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новый чат</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chatName">Название чата</Label>
            <Input
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Введите название чата"
            />
          </div>

          <div className="space-y-2">
            <Label>Тип чата</Label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="group"
                  checked={chatType === "group"}
                  onChange={(e) => setChatType(e.target.value as "group")}
                  className="sr-only"
                />
                <div className={`flex items-center space-x-2 px-3 py-2 rounded border ${
                  chatType === "group" ? "bg-anvik-primary text-white" : "bg-muted"
                }`}>
                  <Users className="h-4 w-4" />
                  <span>Групповой</span>
                </div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="direct"
                  checked={chatType === "direct"}
                  onChange={(e) => setChatType(e.target.value as "direct")}
                  className="sr-only"
                />
                <div className={`flex items-center space-x-2 px-3 py-2 rounded border ${
                  chatType === "direct" ? "bg-anvik-primary text-white" : "bg-muted"
                }`}>
                  <User className="h-4 w-4" />
                  <span>Личный</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Участники</Label>
            <ScrollArea className="h-40 border rounded p-2">
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.position}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateChat} disabled={isLoading}>
              {isLoading ? "Создание..." : "Создать чат"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatDialog;
