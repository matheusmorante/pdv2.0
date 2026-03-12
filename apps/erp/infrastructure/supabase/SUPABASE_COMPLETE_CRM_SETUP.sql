-- ==========================================
-- 🎯 SETUP ROBUSTO: CRM & VOICE BI MORANTE
-- Este script garante tabelas, COLUNAS e permissões.
-- ==========================================

-- 1. Garantir que as tabelas existam
CREATE TABLE IF NOT EXISTS public.attendance_logs (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.customer_desires (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);
CREATE TABLE IF NOT EXISTS public.desire_matches (id UUID DEFAULT gen_random_uuid() PRIMARY KEY);

-- 2. Adicionar/Verificar colunas para attendance_logs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='date') THEN ALTER TABLE public.attendance_logs ADD COLUMN date TIMESTAMPTZ DEFAULT now(); END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='salesperson_name') THEN ALTER TABLE public.attendance_logs ADD COLUMN salesperson_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='customer_phone') THEN ALTER TABLE public.attendance_logs ADD COLUMN customer_phone TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='transcript') THEN ALTER TABLE public.attendance_logs ADD COLUMN transcript TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='audio_url') THEN ALTER TABLE public.attendance_logs ADD COLUMN audio_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='structured_data') THEN ALTER TABLE public.attendance_logs ADD COLUMN structured_data JSONB; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='created_at') THEN ALTER TABLE public.attendance_logs ADD COLUMN created_at TIMESTAMPTZ DEFAULT now(); END IF;
END $$;

-- 3. Adicionar/Verificar colunas para customer_desires
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='customer_phone') THEN ALTER TABLE public.customer_desires ADD COLUMN customer_phone TEXT DEFAULT ''; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='customer_name') THEN ALTER TABLE public.customer_desires ADD COLUMN customer_name TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='product_name') THEN ALTER TABLE public.customer_desires ADD COLUMN product_name TEXT DEFAULT ''; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='category') THEN ALTER TABLE public.customer_desires ADD COLUMN category TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='details') THEN ALTER TABLE public.customer_desires ADD COLUMN details TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='status') THEN ALTER TABLE public.customer_desires ADD COLUMN status TEXT DEFAULT 'pending'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_desires' AND column_name='created_at') THEN ALTER TABLE public.customer_desires ADD COLUMN created_at TIMESTAMPTZ DEFAULT now(); END IF;
END $$;

-- 4. Adicionar/Verificar colunas para desire_matches
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='desire_matches' AND column_name='desire_id') THEN ALTER TABLE public.desire_matches ADD COLUMN desire_id UUID REFERENCES public.customer_desires(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='desire_matches' AND column_name='product_id') THEN ALTER TABLE public.desire_matches ADD COLUMN product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='desire_matches' AND column_name='notified') THEN ALTER TABLE public.desire_matches ADD COLUMN notified BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='desire_matches' AND column_name='created_at') THEN ALTER TABLE public.desire_matches ADD COLUMN created_at TIMESTAMPTZ DEFAULT now(); END IF;
END $$;

-- ==========================================
-- 🛡️ ÍNDICES & PERMISSÕES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_attend_phone ON public.attendance_logs(customer_phone);
CREATE INDEX IF NOT EXISTS idx_desires_phone ON public.customer_desires(customer_phone);
CREATE INDEX IF NOT EXISTS idx_desires_status ON public.customer_desires(status);
CREATE INDEX IF NOT EXISTS idx_matches_desire ON public.desire_matches(desire_id);
CREATE INDEX IF NOT EXISTS idx_matches_product ON public.desire_matches(product_id);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_desires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desire_matches ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir full attendance' AND tablename = 'attendance_logs') THEN
        CREATE POLICY "Permitir full attendance" ON public.attendance_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir full desires' AND tablename = 'customer_desires') THEN
        CREATE POLICY "Permitir full desires" ON public.customer_desires FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir full matches' AND tablename = 'desire_matches') THEN
        CREATE POLICY "Permitir full matches" ON public.desire_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
