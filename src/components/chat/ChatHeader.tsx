
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ChatRoom } from '@/types/chat-types';
import { User, Users } from 'lucide-react';

interface ChatHeaderProps {
  chat: ChatRoom;
}

const ChatHeader = ({ chat }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-anvik-primary/10 text-anvik-primary">
            {chat.type === "direct" ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{chat.name}</h3>
          <p className="text-xs text-muted-foreground">
            {chat.type === "group"
              ? `${chat.participants.length} участников`
              : "Личное сообщение"}
          </p>
        </div>
      </div>
      
      <div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => toast({ 
            title: "В разработке", 
            description: "Настройки чата в разработке" 
          })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
