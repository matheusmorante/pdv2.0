import Order from "../types/order.type";
import { supabase } from "./supabaseConfig";
import { capitalizeOrder } from "./formatters";
import { saveInventoryMove } from "./inventoryService";
import { updateProduct } from "./productService";

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

        // Inventory management - Only subtract stock if the order is FINAL (not a draft)
        if (order.orderType === 'sale' && order.items && order.status !== 'draft') {
            for (const item of order.items) {
                if (item.productId) {
                    // Fetch latest stock to be sure
                    const { data: p } = await supabase.from('products').select('*').eq('id', item.productId).single();
                    if (!p) continue;
                    const currentStock = p.stock || 0;

                    if (p.isCombo && p.combo_items && Array.isArray(p.combo_items)) {
                        for (const comboItem of p.combo_items) {
                            // Find current stock of the part
                            const { data: part } = await supabase.from('products').select('stock').eq('id', comboItem.productId).single();
                            const currentPartStock = part?.stock || 0;

                            await saveInventoryMove({
                                productId: comboItem.productId,
                                variationId: comboItem.variationId,
                                productDescription: comboItem.description || `Parte do combo ${item.description}`,
                                type: 'withdrawal',
                                quantity: comboItem.quantity * item.quantity, // Multiply part qty by combo qty
                                date: new Date().toISOString(),
                                label: 'Venda (Combo)',
                                observation: `Parte do Combo #${item.description} no Pedido #${rowId}`
                            }, currentPartStock);
                        }
                    }

                    // Always record the movement for the main product (or combo itself, for history/reference)
                    // Even if it's a combo with virtual stock, recording the move helps tracking.
                    await saveInventoryMove({
                        productId: item.productId,
                        variationId: item.variationId,
                        productDescription: item.description,
                        type: 'withdrawal',
                        quantity: item.quantity,
                        date: new Date().toISOString(),
                        label: 'Venda',
                        observation: `Pedido #${rowId}`
                    }, currentStock);
                }
            }
        }

        return String(rowId);
    } catch (error) {
        console.error("Erro ao salvar o pedido: ", error);
        throw error;
    }
};

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
