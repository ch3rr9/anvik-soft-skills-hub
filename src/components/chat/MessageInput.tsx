
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="p-4 border-t">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
