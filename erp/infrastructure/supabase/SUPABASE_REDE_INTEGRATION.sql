-- =========================================
-- INTEGRAÇÃO REDE (ITAÚ) - E-REDE & PIX
-- =========================================

-- 1. Configurações da API Rede
CREATE TABLE IF NOT EXISTS public.rede_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pv TEXT NOT NULL, -- Número de Filiação (Ponto de Venda)
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'production')) DEFAULT 'sandbox',
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.rede_config ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage rede_config' AND tablename = 'rede_config') THEN
        CREATE POLICY "Admins can manage rede_config" ON public.rede_config FOR ALL USING (true);
    END IF;
END $$;

-- 2. Logs de Transações Rede
CREATE TABLE IF NOT EXISTS public.rede_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id BIGINT, -- Vinculado à tabela orders
    tid TEXT, -- Transaction ID (Rede)
    nsu TEXT, -- NSU (Rede)
    authorization_code TEXT,
    amount NUMERIC(15,2) NOT NULL,
    installments INTEGER DEFAULT 1,
    status TEXT NOT NULL, -- 'approved', 'declined', 'pending', 'refunded'
    payment_method TEXT NOT NULL, -- 'credit_card', 'debit_card', 'pix'
    last_four TEXT, -- Últimos 4 dígitos se cartão
    brand TEXT, -- Bandeira (Visa, Master, etc)
    raw_response JSONB, -- Resposta completa da API para debug
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.rede_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'View transaction logs' AND tablename = 'rede_transactions') THEN
        CREATE POLICY "View transaction logs" ON public.rede_transactions FOR SELECT USING (true);
    END IF;
END $$;

-- 3. Trigger para updated_at
CREATE TRIGGER update_rede_config_updated_at BEFORE UPDATE ON public.rede_config FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
