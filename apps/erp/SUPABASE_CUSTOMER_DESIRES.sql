-- Execute este comando no SQL Editor do seu Supabase para habilitar o CRM de Desejos
CREATE TABLE IF NOT EXISTS public.customer_desires (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    product_name TEXT NOT NULL,
    category TEXT,
    details TEXT, -- Cor, medida, etc.
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_desires_phone ON public.customer_desires(customer_phone);
CREATE INDEX IF NOT EXISTS idx_desires_status ON public.customer_desires(status);

-- Permissões básicas
ALTER TABLE public.customer_desires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserção para autenticados" ON public.customer_desires FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura para autenticados" ON public.customer_desires FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir atualização para autenticados" ON public.customer_desires FOR UPDATE TO authenticated USING (true);
