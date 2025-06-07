
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatRoom, Message } from '@/types/chat-types';

export const useRealtimeChat = (
  userId: string | undefined,
  onChatUpdate: (chats: ChatRoom[]) => void,
  onMessageUpdate: (chatId: string, message: Message) => void
) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up realtime subscriptions for user:', userId);

    // Подписка на изменения в чатах
    const chatsChannel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          console.log('Chat change detected:', payload);
          // Уведомляем родительский компонент о необходимости обновления
          window.dispatchEvent(new CustomEvent('chat-updated'));
        }
      )
      .subscribe();

    // Подписка на новые сообщения
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          const message: Message = {
            id: newMessage.id,
            chatId: newMessage.chat_id,
            content: newMessage.content,
            senderId: newMessage.sender_id,
            senderName: newMessage.sender_name,
            timestamp: newMessage.timestamp,
            read: newMessage.read
          };

          onMessageUpdate(newMessage.chat_id, message);
        }
      )
      .subscribe();

    // Отслеживание состояния подключения
    chatsChannel.subscribe((status) => {
      console.log('Chats channel status:', status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(chatsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, onMessageUpdate]);

  return { isConnected };
};
