
-- Since we've removed unread count functionality, we're not using this function anymore.
-- If this function is still needed for other purposes, you can modify it accordingly.
-- For now, we're just commenting it out.

/*
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
*/
