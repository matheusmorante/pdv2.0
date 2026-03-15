import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixBlingStatusRefined() {
    console.log('--- INICIANDO CORREÇÃO FINAL DE PAGAMENTOS E COMPATIBILIDADE (Bling) ---');

    const { data: products } = await supabase.from('products').select('id, cost_price, unit_price');
    const productMap = new Map();
    (products || []).forEach(p => productMap.set(String(p.id), p));

    let processedCount = 0;
    let fixCount = 0;
    let hasMore = true;
    let offset = 0;
    const pageSize = 1000;

    while (hasMore) {
        console.log(`Página: registros ${offset} até ${offset + pageSize}...`);
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .range(offset, offset + pageSize - 1)
            .order('id', { ascending: true });

        if (error || !orders || orders.length === 0) break;

        for (const order of orders) {
            processedCount++;
            let orderData = order.order_data;
            if (!orderData || orderData.marketingOrigin !== 'Bling') continue;

            let needsUpdate = false;

            // 1. Normalização de Status do Pedido
            const rawStatus = String(orderData.status || '').toLowerCase();
            let targetStatus = rawStatus.includes('cancel') ? 'cancelled' : 'fulfilled';
            if (orderData.status !== targetStatus) {
                orderData.status = targetStatus;
                if (targetStatus === 'fulfilled') orderData.stockProcessed = true;
                needsUpdate = true;
            }

            // 2. Normalização de Pagamentos (value -> amount, e status sempre 'pago')
            if (orderData.payments && Array.isArray(orderData.payments)) {
                for (const payment of orderData.payments) {
                    // Mapeia valor
                    if (payment.value !== undefined && payment.amount === undefined) {
                      payment.amount = payment.value;
                      needsUpdate = true;
                    }
                    // Força status 'pago' (Bling não envia status de pagamento)
                    if (payment.status !== 'pago') {
                      payment.status = 'pago';
                      needsUpdate = true;
                    }
                    // Garante outros campos obrigatórios
                    if (payment.fee === undefined) {
                      payment.fee = 0;
                      needsUpdate = true;
                    }
                    if (payment.feeType === undefined) {
                      payment.feeType = 'fixed';
                      needsUpdate = true;
                    }
                }
            }

            // 3. Compatibilidade de Sistema (Modalidade e Tipo de Pedido)
            if (!orderData.shipping) orderData.shipping = {};
            if (orderData.shipping.deliveryMethod !== 'delivery') {
                orderData.shipping.deliveryMethod = 'delivery';
                needsUpdate = true;
            }
            if (orderData.shipping.orderType !== 'Na caixa com montagem') {
                orderData.shipping.orderType = 'Na caixa com montagem';
                needsUpdate = true;
            }

            // 4. Data de Entrega
            if (!orderData.shipping.scheduling) orderData.shipping.scheduling = {};
            if (!orderData.shipping.scheduling.date || orderData.shipping.scheduling.date === '-' || orderData.shipping.scheduling.date === '') {
                orderData.shipping.scheduling.date = orderData.date;
                orderData.shipping.scheduling.time = orderData.shipping.scheduling.time || '-';
                orderData.shipping.scheduling.type = orderData.shipping.scheduling.type || 'fixed';
                needsUpdate = true;
            }

            // 5. Custos e Preços dos Itens + handlingType
            let itemsNeededFix = false;
            let recalculatedCost = 0;
            let recalculatedSubtotal = 0;

            if (orderData.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
                for (const item of orderData.items) {
                    // handlingType
                    if (item.handlingType !== 'Na caixa com montagem') {
                        item.handlingType = 'Na caixa com montagem';
                        itemsNeededFix = true;
                    }

                    // Preencher custo/preço zerados
                    if ((!item.costPrice || item.costPrice === 0) && item.productId) {
                        const ref = productMap.get(String(item.productId));
                        if (ref && ref.cost_price > 0) {
                            item.costPrice = ref.cost_price;
                            itemsNeededFix = true;
                        }
                    }
                    if ((!item.unitPrice || item.unitPrice === 0) && item.productId) {
                        const ref = productMap.get(String(item.productId));
                        if (ref && ref.unit_price > 0) {
                            item.unitPrice = ref.unit_price;
                            itemsNeededFix = true;
                        }
                    }
                    
                    recalculatedCost += (item.quantity || 0) * (item.costPrice || 0);
                    recalculatedSubtotal += (item.quantity || 0) * (item.unitPrice || 0);
                }
            }

            // 6. Estrutura Financeira (Payments Summary)
            const ps = orderData.paymentsSummary || {};
            // Forçamos o recalculo se houver mudança nos itens ou se for pedido Atendido (para zerar saldo)
            if (itemsNeededFix || needsUpdate || ps.totalOrderValue === undefined || ps.totalOrderValue === 0) {
                const finalSubtotal = recalculatedSubtotal || orderData.itemsSummary?.itemsTotalValue || 0;
                
                orderData.itemsSummary = {
                    ...orderData.itemsSummary,
                    totalItemsCost: recalculatedCost,
                    itemsSubtotal: finalSubtotal,
                    itemsTotalValue: finalSubtotal
                };

                const paymentsTotal = (orderData.payments || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);

                orderData.paymentsSummary = {
                    totalPaymentsFee: ps.totalPaymentsFee || 0,
                    totalOrderValue: finalSubtotal,
                    totalAmountPaid: orderData.status === 'fulfilled' ? finalSubtotal : (paymentsTotal || ps.totalAmountPaid || 0),
                    amountRemaining: orderData.status === 'fulfilled' ? 0 : (finalSubtotal - (paymentsTotal || ps.totalAmountPaid || 0))
                };
                needsUpdate = true;
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({ order_data: orderData, updated_at: new Date().toISOString() })
                    .eq('id', order.id);

                if (updateError) {
                    console.error(`Erro no pedido ${order.id}:`, updateError.message);
                } else {
                    fixCount++;
                }
            }
        }

        if (orders.length < pageSize) hasMore = false;
        else offset += pageSize;
    }

    console.log(`\n--- FIM ---`);
    console.log(`Lidos: ${processedCount} | Corrigidos: ${fixCount}`);
}

fixBlingStatusRefined().catch(console.error);
