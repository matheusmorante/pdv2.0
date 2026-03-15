import { supabase } from '@/pages/utils/supabaseConfig';
import { FinancialCategory, AccountPayable, AccountReceivable, FinancialTransaction } from '../types/finance.type';

export const financeService = {
  // --- Categorias ---
  async getCategories(type?: 'income' | 'expense') {
    let query = supabase.from('financial_categories').select('*');
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data as FinancialCategory[];
  },

  // --- Contas a Pagar ---
  async getPayables(status?: string) {
    let query = supabase.from('accounts_payable').select('*, financial_categories(name)').order('due_date', { ascending: true });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createPayable(payable: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('accounts_payable').insert([payable]).select().single();
    if (error) throw error;
    return data as AccountPayable;
  },

  async bulkCreatePayables(payables: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase.from('accounts_payable').insert(payables).select();
    if (error) throw error;
    return data as AccountPayable[];
  },

  async updatePayable(id: string, updates: Partial<AccountPayable>) {
    const { data, error } = await supabase.from('accounts_payable').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as AccountPayable;
  },

  // --- Despesas Fixas / Recorrentes ---
  async getRecurringExpenses(activeOnly: boolean = true) {
    let query = supabase.from('recurring_expenses').select('*, financial_categories(name)').order('created_at', { ascending: false });
    if (activeOnly) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createRecurringExpense(expense: Omit<any, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('recurring_expenses').insert([expense]).select().single();
    if (error) throw error;
    return data;
  },

  async updateRecurringExpense(id: string, updates: Partial<any>) {
    const { data, error } = await supabase.from('recurring_expenses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // --- Contas a Receber ---
  async getReceivables(status?: string) {
    let query = supabase.from('accounts_receivable').select('*, financial_categories(name)').order('due_date', { ascending: true });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createReceivable(receivable: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('accounts_receivable').insert([receivable]).select().single();
    if (error) throw error;
    return data as AccountReceivable;
  },

  async updateReceivable(id: string, updates: Partial<AccountReceivable>) {
    const { data, error } = await supabase.from('accounts_receivable').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as AccountReceivable;
  },

  // --- Fluxo de Caixa / Transações ---
  async getTransactions(startDate?: string, endDate?: string) {
    let query = supabase.from('financial_transactions').select('*, financial_categories(name)').order('date', { ascending: false });
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('financial_transactions').insert([transaction]).select().single();
    if (error) throw error;
    return data as FinancialTransaction;
  },

  // --- Integração Rede ---
  async getRedeConfig() {
    const { data, error } = await supabase.from('rede_config').select('*').single();
    if (error && error.code !== 'PGRST116') throw error; // Ignorar "não encontrado" (vazio)
    return data;
  },

  async updateRedeConfig(config: any) {
    const { data: existing } = await supabase.from('rede_config').select('id').single();
    let result;
    if (existing) {
      result = await supabase.from('rede_config').update(config).eq('id', existing.id).select().single();
    } else {
      result = await supabase.from('rede_config').insert([config]).select().single();
    }
    if (result.error) throw result.error;
    return result.data;
  },

  async getRedeTransactions(limit = 50) {
    const { data, error } = await supabase.from('rede_transactions').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  }
};
