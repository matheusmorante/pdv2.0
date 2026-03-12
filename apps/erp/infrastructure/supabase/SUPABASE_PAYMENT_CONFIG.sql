-- PAYMENT METHODS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.payment_methods_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'Pix', 'Crédito', 'Débito', 'Dinheiro', 'Crediário'
    installments_model TEXT NOT NULL DEFAULT 'single', -- 'single' (à vista), 'monthly' (30 em 30)
    days_to_receive INTEGER NOT NULL DEFAULT 0, -- D+0, D+1, D+7, D+30
    fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert Default Rules
INSERT INTO public.payment_methods_config (name, installments_model, days_to_receive, fee_percentage)
VALUES 
    ('Pix', 'single', 0, 0.00),
    ('Dinheiro', 'single', 0, 0.00),
    ('Débito', 'single', 1, 0.00),
    ('Cartão de Crédito', 'monthly', 30, 0.00),
    ('Crediário', 'single', 7, 0.00)
ON CONFLICT (name) DO UPDATE SET
    installments_model = EXCLUDED.installments_model,
    days_to_receive = EXCLUDED.days_to_receive;

-- Enable RLS
ALTER TABLE public.payment_methods_config ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read for authenticated users only') THEN
        CREATE POLICY "Enable read for authenticated users only" ON public.payment_methods_config
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for authenticated users only') THEN
        CREATE POLICY "Enable all for authenticated users only" ON public.payment_methods_config
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;
