
import React from 'react';
import { Message } from '@/types/chat-types';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatMessageTime } from '@/utils/chatUtils';
import { useAuth } from "@/contexts/AuthContext";

interface MessageGroupProps {
  date: string;
  messages: Message[];
}

const MessageGroup = ({ date, messages }: MessageGroupProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Badge variant="outline" className="bg-background">
          {date}
        </Badge>
      </div>
      
      {messages.map((message) => {
        const isMine = message.senderId === user?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[70%] ${isMine ? "order-1" : "order-2"}`}>
              {!isMine && (
                <p className="text-xs text-muted-foreground mb-1 ml-1">
                  {message.senderName}
                </p>
              )}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isMine
                    ? "bg-anvik-primary text-white rounded-tr-none"
                    : "bg-muted rounded-tl-none"
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs text-right mt-1 ${
                  isMine ? "text-white/80" : "text-muted-foreground"
                }`}>
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
            
            {!isMine && (
              <Avatar className="h-8 w-8 mr-2 order-1">
                <AvatarFallback className="bg-anvik-primary/10 text-anvik-primary">
                  {message.senderName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageGroup;
