import Order from "../types/pdvAction.type";
import { supabase } from "./supabaseConfig";
import { capitalizeOrder } from "./formatters";

const TABLE_NAME = "orders";

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*')
        .order('id', { ascending: false })
        .then(({ data, error }) => {
            if (data && !error) {
                const orders = data.map(row => {
                    try {
                        const rawData = { id: String(row.id), ...row.order_data } as Order;
                        return capitalizeOrder(rawData);
                    } catch (e) {
                        return { id: String(row.id), ...row.order_data } as Order;
                    }
                });
                callback(orders);
            } else if (error) {
                console.error("Erro ao buscar pedidos iniciais:", error);
                callback([]);
            }
        });

    const channel = supabase.channel('orders_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
             supabase.from(TABLE_NAME)
                .select('*')
                .order('id', { ascending: false })
                .then(({ data }) => {
                    if (data) {
                        const orders = data.map(row => {
                            try {
                                const rawData = { id: String(row.id), ...row.order_data } as Order;
                                return capitalizeOrder(rawData);
                            } catch (e) {
                                return { id: String(row.id), ...row.order_data } as Order;
                            }
                        });
                        callback(orders);
                    }
                });
        })
        .subscribe();

    return () => {
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
        return String(data[0].id);
    } catch (error) {
        console.error("Erro ao salvar o pedido: ", error);
        throw error;
    }
};

export const updateOrder = async (id: string, orderToUpdate: Partial<Order>): Promise<void> => {
    try {
        // Fetch current data first to merge
        const { data: current } = await supabase
            .from(TABLE_NAME)
            .select('order_data')
            .eq('id', parseInt(id))
            .single();

        const merged = { ...(current?.order_data || {}), ...orderToUpdate };
        delete merged.id;

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({ 
                order_data: merged,
                updated_at: new Date().toISOString()
            })
            .eq('id', parseInt(id));
        
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
        });
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
        });
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
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o pedido: ", error);
        throw error;
    }
};

/** @deprecated Use moveToTrash instead */
export const deleteOrder = moveToTrash;
