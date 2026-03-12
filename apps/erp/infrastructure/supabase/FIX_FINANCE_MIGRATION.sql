-- PATCH DE CORREÇÃO: Módulo Financeiro
-- Execute este comando no SQL Editor do Supabase para permitir a migração dos dados históricos.

-- 1. Alterar tipo de order_id para BIGINT (compatibilidade com tabela orders)
ALTER TABLE public.accounts_receivable 
  ALTER COLUMN order_id TYPE BIGINT USING order_id::text::bigint;

-- 2. Garantir que a categoria de Vendas exista
INSERT INTO public.financial_categories (name, type) 
VALUES ('Vendas de Produtos', 'income') 
ON CONFLICT DO NOTHING;

-- 3. (Opcional) Adicionar relacionamento se desejar integridade referencial forte futuramente
-- ALTER TABLE public.accounts_receivable 
-- ADD CONSTRAINT fk_receivable_order FOREIGN KEY (order_id) REFERENCES public.orders(id);
