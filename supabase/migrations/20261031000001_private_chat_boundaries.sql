-- Clinical source tables remain shared read-only. Personal conversations are private.
DROP POLICY IF EXISTS "Allow view access to non-private chats" ON public.chats;
DROP POLICY IF EXISTS "Allow view access to messages for non-private chats" ON public.messages;
DROP POLICY IF EXISTS "Chat folder must belong to caller workspace" ON public.chats;
CREATE POLICY "Chat folder must belong to caller workspace" ON public.chats AS RESTRICTIVE
FOR ALL TO authenticated USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND (folder_id IS NULL OR EXISTS (
 SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid() AND f.workspace_id = chats.workspace_id AND f.type = 'chats'
)));
DROP POLICY IF EXISTS "Message chat must belong to caller" ON public.messages;
CREATE POLICY "Message chat must belong to caller" ON public.messages AS RESTRICTIVE
FOR ALL TO authenticated USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND EXISTS (
 SELECT 1 FROM public.chats c WHERE c.id = chat_id AND c.user_id = auth.uid()
));
