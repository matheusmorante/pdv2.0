-- Execute este comando no SQL Editor do seu Supabase para habilitar o Voice BI
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT now(),
    salesperson_name TEXT,
    customer_phone TEXT,
    transcript TEXT,
    structured_data JSONB, -- Contém produto, motivo, sentimentos, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Permissões básicas (ajuste conforme necessário)
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir inserção para autenticados" ON public.attendance_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura para autenticados" ON public.attendance_logs FOR SELECT TO authenticated USING (true);
