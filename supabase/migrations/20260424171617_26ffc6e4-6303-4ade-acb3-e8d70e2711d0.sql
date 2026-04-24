ALTER TABLE public.accounts ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;

CREATE POLICY "Public can view accounts" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "Public can insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update accounts" ON public.accounts FOR UPDATE USING (true);
CREATE POLICY "Public can delete accounts" ON public.accounts FOR DELETE USING (true);