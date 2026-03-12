-- RECURRING EXPENSES (Despesas Fixas e Recorrentes)
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES public.financial_categories(id),
    frequency TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    due_day INTEGER NOT NULL, -- Dia do vencimento (Ex: 5)
    start_date DATE NOT NULL,
    end_date DATE, -- Pode ser nulo se for por prazo indeterminado
    active BOOLEAN DEFAULT true,
    last_processed_date DATE, -- Para saber até quando já geramos as Contas a Pagar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Enable all for authenticated users only" ON public.recurring_expenses
    FOR ALL USING (auth.role() = 'authenticated');
