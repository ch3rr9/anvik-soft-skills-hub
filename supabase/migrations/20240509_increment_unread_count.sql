
-- Функция для увеличения счетчика непрочитанных сообщений
CREATE OR REPLACE FUNCTION public.increment_unread_count(chat_id INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chats
  SET unread_count = unread_count + 1
  WHERE id = chat_id;
END;
$$;
