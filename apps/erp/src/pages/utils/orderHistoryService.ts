import Order from "../types/order.type";
import { supabase } from "./supabaseConfig";
import { capitalizeOrder } from "./formatters";
import { saveInventoryMove } from "./inventoryService";
import { updateProduct } from "./productService";
import { getSettings } from "./settingsService";

const TABLE_NAME = "orders";

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    console.log('[OrdersSync] Start subscription');

    let aborted = false;

    const fetchAndCallback = async () => {
        if (aborted) return;
        try {
            console.log('[OrdersSync] Fetching data...');

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('id', { ascending: false });

            if (aborted) {
                console.log('[OrdersSync] Fetch completed but subscription was cancelled, ignoring.');
                return;
            }

            if (error) {
                console.error('[OrdersSync] Fetch error:', error);
                callback([]);
                return;
            }

            if (data && Array.isArray(data)) {
                console.log('[OrdersSync] Data received, count:', data.length);
                const orders = data.map((row: any) => {
                    try {
                        const rawData = { ...(row.order_data || {}), id: String(row.id) } as Order;
                        return capitalizeOrder(rawData);
                    } catch (_e) {
                        return { ...(row.order_data || {}), id: String(row.id) } as Order;
                    }
                });
                callback(orders);
            } else {
                console.warn('[OrdersSync] No data or invalid format:', typeof data);
                callback([]);
            }
        } catch (err) {
            if (!aborted) {
                console.error('[OrdersSync] Exception in fetch:', err);
                callback([]);
            }
        }
    };

    fetchAndCallback();

    const channel = supabase.channel(`orders_changes_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
            if (!aborted) {
                console.log('[OrdersSync] Change detected, refetching...');
                fetchAndCallback();
            }
        })
        .subscribe((status) => {
            console.log('[OrdersSync] Channel status:', status);
        });

    return () => {
        console.log('[OrdersSync] Removing channel');
        aborted = true;
        supabase.removeChannel(channel);
    };
};

export const saveOrder = async (order: Order): Promise<string> => {
    if (order.id) {
        await updateOrder(order.id, order);
        return order.id;
    }

    try {
        const orderToSave = { ...order };
        delete orderToSave.id;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                order_data: orderToSave,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        const rowId = (data as any)?.[0]?.id;

        // Stock Management logic refactored into a separate function for reuse and clarity
        const updatedOrder = await handleStockAndBusinessRules(rowId, orderToSave);
        if (updatedOrder.stockProcessed) {
            await updateOrder(String(rowId), { stockProcessed: true });
        }

        return String(rowId);
    } catch (error) {
        console.error("Erro ao salvar o pedido: ", error);
        throw error;
    }
};

/**
 * Centrailized logic for stock movements based on settings and order state.
 * Returns the modified order with stockProcessed flag if applicable.
 */
async function handleStockAndBusinessRules(orderId: string, order: Order): Promise<Order> {
    const settings = getSettings();
    const { businessRules } = settings;
    const orderToUpdate = { ...order };

    // Don't process assistance orders or orders already processed
    if (order.orderType !== 'sale' || order.stockProcessed) return orderToUpdate;

    // Determine if stock should be subtracted:
    // - If it's NOT a draft
    // - OR if autoReserveStock is enabled
    const shouldSubtractStock = order.status !== 'draft' || businessRules.autoReserveStock;

    if (shouldSubtractStock && order.items) {
        // Rule: Negative Stock Check (if disabled)
        if (!businessRules.allowNegativeStock) {
            for (const item of order.items) {
                if (item.productId) {
                    const { data: p } = await supabase.from('products').select('stock, title').eq('id', item.productId).single();
                    if (p && (p.stock || 0) < item.quantity) {
                        throw new Error(`Estoque insuficiente para o produto: ${p.title}. (Saldo: ${p.stock || 0}, Necessário: ${item.quantity})`);
                    }
                }
            }
        }

        // All checks passed, proceed with withdrawal
        for (const item of order.items) {
            if (item.productId) {
                const { data: p } = await supabase.from('products').select('*').eq('id', item.productId).single();
                if (!p) continue;
                
                const currentStock = p.stock || 0;

                // Handle Combo Items
                if (p.isCombo && p.combo_items && Array.isArray(p.combo_items)) {
                    for (const comboItem of p.combo_items) {
                        const { data: part } = await supabase.from('products').select('stock').eq('id', comboItem.productId).single();
                        const currentPartStock = part?.stock || 0;

                        await saveInventoryMove({
                            productId: comboItem.productId,
                            variationId: comboItem.variationId,
                            productDescription: comboItem.description || `Parte do combo ${item.description}`,
                            type: 'withdrawal',
                            quantity: comboItem.quantity * item.quantity,
                            date: new Date().toISOString(),
                            label: 'Venda (Combo)',
                            observation: `Parte do Combo #${item.description} no Pedido #${orderId}`
                        }, currentPartStock);
                    }
                }

                // Record move for main product
                await saveInventoryMove({
                    productId: item.productId,
                    variationId: item.variationId,
                    productDescription: item.description,
                    type: 'withdrawal',
                    quantity: item.quantity,
                    date: new Date().toISOString(),
                    label: 'Venda',
                    observation: `Pedido #${orderId}`
                }, currentStock);
            }
        }
        orderToUpdate.stockProcessed = true;
    }

    return orderToUpdate;
}

/**
 * Atualiza um pedido. Quando `currentOrder` é fornecido (estado local),
 * o pré-fetch no banco é evitado — apenas o update é executado.
 */
export const updateOrder = async (
    id: string,
    orderToUpdate: Partial<Order>,
    currentOrder?: Order
): Promise<void> => {
    try {
        let merged: any;

        if (currentOrder) {
            // Temos o pedido completo em memória — skip do SELECT no banco
            const { id: _id, ...rest } = { ...(currentOrder || {}), ...orderToUpdate, id: undefined } as any;
            merged = rest;
        } else {
            // Fallback: busca o pedido completo no banco antes de mesclar
            const { data: current, error: fetchError } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) {
                // Se o fetch falhar mas tivermos a atualização parcial, tenta mesmo assim
                console.warn('Pré-fetch falhou, aplicando atualização parcial:', fetchError);
                const { id: _id, ...rest } = orderToUpdate as any;
                merged = rest;
            } else {
                const { id: _id, ...rest } = { ...(current?.order_data || {}), ...orderToUpdate, id: undefined } as any;
                merged = rest;
            }
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({
                order_data: merged,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        // Check if we need to process stock NOW (transition from draft or settings change)
        if (!merged.stockProcessed) {
            const updatedOrder = await handleStockAndBusinessRules(id, merged);
            if (updatedOrder.stockProcessed) {
                // Secondary update to mark stock as processed to avoid double-dipping
                await supabase
                    .from(TABLE_NAME)
                    .update({
                        order_data: { ...merged, stockProcessed: true },
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id);
            }
        }
    } catch (error) {
        console.error("Erro ao atualizar o pedido: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateOrder(id, {
            deleted: true,
            deletedAt: new Date().toLocaleString('pt-BR')
        } as any);
    } catch (error) {
        console.error("Erro ao mover para lixeira: ", error);
        throw error;
    }
};

export const restoreOrder = async (id: string): Promise<void> => {
    try {
        await updateOrder(id, {
            deleted: false,
            deletedAt: null
        } as any);
    } catch (error) {
        console.error("Erro ao restaurar o pedido: ", error);
        throw error;
    }
};

export const permanentDeleteOrder = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o pedido: ", error);
        throw error;
    }
};

/** @deprecated Use moveToTrash instead */
export const deleteOrder = moveToTrash;

/**
 * Analisa os últimos pedidos para identificar a frequência de uso de avisos (observações)
 */
export const getNoticeFrequency = async (): Promise<Record<string, number>> => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('order_data')
            .order('id', { ascending: false })
            .limit(200);

        if (error) throw error;

        const frequency: Record<string, number> = {};
        
        data?.forEach(row => {
            const observation = row.order_data?.observation;
            if (observation) {
                const tags = observation.split(';').map((t: string) => t.trim()).filter((t: string) => t !== "");
                tags.forEach((tag: string) => {
                    frequency[tag] = (frequency[tag] || 0) + 1;
                });
            }
        });

        return frequency;
    } catch (error) {
        console.error("Erro ao carregar frequência de avisos:", error);
        return {};
    }
};
