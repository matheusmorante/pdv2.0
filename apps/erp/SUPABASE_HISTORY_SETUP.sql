-- ==========================================
-- 📈 SISTEMA DE HISTÓRICOS: PREÇO, CUSTO E STATUS
-- ==========================================

-- 1. Tabela de Histórico de Status de Pedido
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT,
    changed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Histórico de Preços (Garantir colunas)
CREATE TABLE IF NOT EXISTS public.product_price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variation_id TEXT,
    old_unit_price DECIMAL(10,2),
    new_unit_price DECIMAL(10,2),
    old_cost_price DECIMAL(10,2),
    new_cost_price DECIMAL(10,2),
    change_type TEXT, -- 'unit_price', 'cost_price', 'both'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Histórico de Estoque (Garantir Tabela e Custo Unitário)
CREATE TABLE IF NOT EXISTS public.inventory_moves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    variation_id TEXT,
    product_description TEXT,
    type TEXT, -- 'entry', 'withdrawal', 'balance'
    quantity DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    date TIMESTAMPTZ DEFAULT now(),
    label TEXT,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_moves' AND column_name='unit_cost') THEN 
        ALTER TABLE public.inventory_moves ADD COLUMN unit_cost DECIMAL(10,2); 
    END IF;
END $$;

-- 🛡️ ÍNDICES & RLs
CREATE INDEX IF NOT EXISTS idx_order_hist_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_price_hist_prod ON public.product_price_history(product_id);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir full history status' AND tablename = 'order_status_history') THEN
        CREATE POLICY "Permitir full history status" ON public.order_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir full price history' AND tablename = 'product_price_history') THEN
        CREATE POLICY "Permitir full price history" ON public.product_price_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
