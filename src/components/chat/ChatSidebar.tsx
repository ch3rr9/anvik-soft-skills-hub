
import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { ChatRoom } from '@/types/chat-types';
import { User, Users } from 'lucide-react';

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  selectedChat: ChatRoom | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onChatSelect: (chat: ChatRoom) => void;
  isLoading: boolean;
}

const ChatSidebar = ({ 
  chatRooms, 
  selectedChat, 
  searchTerm, 
  onSearchChange, 
  onChatSelect,
  isLoading
}: ChatSidebarProps) => {
  const createNewChat = () => {
    toast({
      title: "В разработке",
      description: "Функционал создания новых чатов находится в разработке",
    });
  };

  return (
    <div className="w-full max-w-xs border-r">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Чаты</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={createNewChat}>
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Создать новый чат</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-1 pr-4">
            {chatRooms.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer ${
                  selectedChat?.id === chat.id
                    ? "bg-anvik-primary text-white"
                    : "hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <Avatar className={`h-10 w-10 ${selectedChat?.id === chat.id ? "border-2 border-white" : ""}`}>
                    <AvatarFallback className={`${
                      selectedChat?.id === chat.id ? "bg-white text-anvik-primary" : "bg-anvik-primary/10 text-anvik-primary"
                    }`}>
                      {chat.type === "direct" ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  {/* Removed unread count badge */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    selectedChat?.id === chat.id ? "text-white" : ""
                  }`}>
                    {chat.name}
                  </p>
                  {chat.lastMessage && (
                    <p className={`text-xs truncate ${
                      selectedChat?.id === chat.id ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatSidebar;
