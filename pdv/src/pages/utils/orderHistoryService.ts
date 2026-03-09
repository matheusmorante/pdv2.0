import Order from "../types/order.type";
import { supabase } from "./supabaseConfig";
import { capitalizeOrder } from "./formatters";

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
                        const rawData = { id: String(row.id), ...row.order_data } as Order;
                        return capitalizeOrder(rawData);
                    } catch (_e) {
                        return { id: String(row.id), ...row.order_data } as Order;
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
        return String(rowId);
    } catch (error) {
        console.error("Erro ao salvar o pedido: ", error);
        throw error;
    }
};

export const updateOrder = async (id: string, orderToUpdate: Partial<Order>): Promise<void> => {
    try {
        const { data: current } = await supabase
            .from(TABLE_NAME)
            .select('order_data')
            .eq('id', parseInt(id, 10))
            .single();

        const merged = { ...(current?.order_data || {}), ...orderToUpdate };
        delete (merged as any).id;

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({
                order_data: merged,
                updated_at: new Date().toISOString()
            })
            .eq('id', parseInt(id, 10));

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
            .eq('id', parseInt(id, 10));

        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o pedido: ", error);
        throw error;
    }
};

/** @deprecated Use moveToTrash instead */
export const deleteOrder = moveToTrash;
