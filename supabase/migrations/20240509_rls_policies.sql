
-- RLS policies для таблицы users
CREATE POLICY "Пользователи могут просматривать всех пользователей" 
ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Пользователи могут обновлять только свои данные" 
ON public.users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

-- RLS policies для таблицы chats
CREATE POLICY "Пользователи могут просматривать чаты, в которых они участвуют" 
ON public.chats FOR SELECT TO authenticated 
USING ((participants)::jsonb @> jsonb_build_array(auth.uid()::text));

CREATE POLICY "Пользователи могут создавать чаты" 
ON public.chats FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Пользователи могут обновлять чаты, в которых они участвуют" 
ON public.chats FOR UPDATE TO authenticated 
USING ((participants)::jsonb @> jsonb_build_array(auth.uid()::text));

-- RLS policies для таблицы messages
CREATE POLICY "Пользователи могут просматривать сообщения в чатах, в которых они участвуют" 
ON public.messages FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.chats
  WHERE chats.id = messages.chat_id
  AND (chats.participants)::jsonb @> jsonb_build_array(auth.uid()::text)
));

CREATE POLICY "Пользователи могут добавлять сообщения в чаты, в которых они участвуют" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chats
  WHERE chats.id = messages.chat_id
  AND (chats.participants)::jsonb @> jsonb_build_array(auth.uid()::text)
));

-- RLS policies для таблицы tests
CREATE POLICY "Тесты доступны для просмотра всем аутентифицированным пользователям" 
ON public.tests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Менеджеры и директора могут создавать и обновлять тесты" 
ON public.tests FOR INSERT TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()::text
  AND (users.role = 'manager' OR users.role = 'director')
));

CREATE POLICY "Менеджеры и директора могут обновлять тесты" 
ON public.tests FOR UPDATE TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()::text
  AND (users.role = 'manager' OR users.role = 'director')
));

-- RLS policies для таблицы test_results
CREATE POLICY "Пользователи могут просматривать свои результаты тестов" 
ON public.test_results FOR SELECT TO authenticated 
USING (user_id = auth.uid()::text);

CREATE POLICY "Менеджеры и директора могут просматривать все результаты" 
ON public.test_results FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.users
  WHERE users.id = auth.uid()::text
  AND (users.role = 'manager' OR users.role = 'director')
));

CREATE POLICY "Пользователи могут добавлять свои результаты тестов" 
ON public.test_results FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid()::text);
