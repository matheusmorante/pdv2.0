import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURAÇÃO ---
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const RECEIVABLES_CSV = 'c:\\Users\\Rosilene\\Desktop\\pdv\\contas_receber.csv';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- HELPERS ---
function parsePrice(val: string) {
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
}

function parseCSVLine(line: string) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

function formatDateToISO(val: string) {
    if (!val) return null;
    const parts = val.split('/');
    if (parts.length < 3) return null;
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
}

async function run() {
    console.log('--- INICIANDO MIGRAÇÃO DE CONTAS A RECEBER ---');

    if (!fs.existsSync(RECEIVABLES_CSV)) {
        console.error(`Arquivo CSV não encontrado em: ${RECEIVABLES_CSV}`);
        return;
    }

    const content = fs.readFileSync(RECEIVABLES_CSV, 'utf-8');
    const lines = content.split('\n');
    const header = parseCSVLine(lines[0]);

    const idx = {
        id: header.indexOf('ID'),
        vencimento: header.indexOf('Data vencimento'),
        valor: header.indexOf('Valor documento'),
        cliente: header.indexOf('Cliente'),
        situacao: header.indexOf('Situação'),
        historico: header.indexOf('Histórico'),
        formaPagamento: header.indexOf('Forma pagamento'),
        liquidacao: header.indexOf('Data liquidação')
    };

    console.log('Buscando pedidos existentes no Banco de Dados...');
    const { data: orders } = await supabase.from('orders').select('id, order_data');
    const orderMap = new Map<string, string>(); // BlingIndex -> ERP_ID (BIGINT)
    
    (orders || []).forEach(o => {
        const index = String((o.order_data as any).orderIndex);
        orderMap.set(index, String(o.id));
    });
    console.log(`Mapeados ${orderMap.size} pedidos do ERP.`);

    console.log('Buscando categorias financeiras...');
    const { data: categories } = await supabase.from('financial_categories').select('id, name');
    const salesCategory = categories?.find(c => c.name === 'Vendas de Produtos')?.id;

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        const historico = cols[idx.historico] || '';
        const match = historico.match(/nº (\d+)/i);
        const orderNum = match ? match[1] : null;
        const erpOrderId = orderNum ? orderMap.get(orderNum) : null;

        if (!erpOrderId) {
            skipCount++;
            continue;
        }

        try {
            const status = (cols[idx.situacao] || '').toLowerCase();
            const erpStatus = status.includes('pago') || status.includes('liquidado') ? 'paid' : 'pending';
            const amount = parsePrice(cols[idx.valor]);
            const dueDate = formatDateToISO(cols[idx.vencimento]);
            const paymentDate = formatDateToISO(cols[idx.liquidacao]);

            // 1. Inserir no Contas a Receber
            const receivableEntry = {
                description: `Pedido #${orderNum} - Bling ID ${cols[idx.id]}`,
                amount: amount,
                due_date: dueDate,
                status: erpStatus,
                category_id: salesCategory,
                customer_name: cols[idx.cliente],
                order_id: erpOrderId,
                payment_date: paymentDate,
                notes: `Importado do Bling. Histórico: ${historico}`
            };

            const { data: newReceivable, error: recError } = await supabase
                .from('accounts_receivable')
                .insert([receivableEntry])
                .select()
                .single();

            if (recError) throw recError;

            // 2. Se estiver pago, criar transação financeira
            if (erpStatus === 'paid' && amount > 0) {
                const { error: transError } = await supabase
                    .from('financial_transactions')
                    .insert([{
                        type: 'income',
                        amount: amount,
                        date: paymentDate || dueDate,
                        description: `Recebimento Pedido #${orderNum}`,
                        payment_method: cols[idx.formaPagamento] || 'Não informado',
                        category_id: salesCategory,
                        receivable_id: (newReceivable as any).id,
                        notes: `Liquidado em ${cols[idx.liquidacao]}`
                    }]);
                
                if (transError) console.warn(`Erro ao criar transação para receivable ${(newReceivable as any).id}:`, transError.message);
            }

            successCount++;
            if (successCount % 100 === 0) console.log(`Processados ${successCount} registros...`);

        } catch (err: any) {
            console.error(`Erro na linha ${i} (Pedido ${orderNum}):`, err.message);
            errorCount++;
        }
    }

    console.log('\n--- RESUMO DA MIGRAÇÃO ---');
    console.log(`Sucesso: ${successCount}`);
    console.log(`Ignorados (sem vínculo de pedido): ${skipCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log('--------------------------');
}

run().catch(console.error);
