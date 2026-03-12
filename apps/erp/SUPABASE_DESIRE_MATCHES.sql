-- Execute este comando no SQL Editor do seu Supabase
CREATE TABLE IF NOT EXISTS public.desire_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    desire_id UUID REFERENCES public.customer_desires(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_matches_desire ON public.desire_matches(desire_id);
CREATE INDEX IF NOT EXISTS idx_matches_product ON public.desire_matches(product_id);
CREATE INDEX IF NOT EXISTS idx_matches_notified ON public.desire_matches(notified);

-- Permissões
ALTER TABLE public.desire_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo para autenticados" ON public.desire_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
