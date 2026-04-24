-- Documents table (foto dokumen)
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public can insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Public can delete documents" ON public.documents FOR DELETE USING (true);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Links table (link penting)
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view links" ON public.links FOR SELECT USING (true);
CREATE POLICY "Public can insert links" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update links" ON public.links FOR UPDATE USING (true);
CREATE POLICY "Public can delete links" ON public.links FOR DELETE USING (true);

CREATE TRIGGER links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();