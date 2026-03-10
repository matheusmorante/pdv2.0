import { supabase } from "./supabaseConfig";
import Purchase from "../types/purchase.type";
import { saveInventoryMove } from "./inventoryService";

const TABLE_NAME = "purchases";

export const subscribeToPurchases = (callback: (purchases: Purchase[]) => void) => {
    supabase.from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: false })
        .then(({ data, error }) => {
            if (data && !error) {
                callback(data.map(mapFromDB));
            } else if (error) {
                console.error("Erro ao buscar compras iniciais:", error);
                callback([]);
            }
        });

    const channel = supabase.channel('purchases_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
            supabase.from(TABLE_NAME)
                .select('*')
                .order('date', { ascending: false })
                .then(({ data }) => {
                    if (data) callback(data.map(mapFromDB));
                });
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const savePurchase = async (purchase: Purchase): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([mapToDB(purchase)])
            .select();

        if (error) throw error;
        const savedId = data?.[0]?.id;

        // If completed, register inventory moves
        if (purchase.status === 'completed') {
            for (const item of purchase.items) {
                // Fetch current stock
                const { data: p } = await supabase.from('products').select('stock').eq('id', item.productId).single();
                const currentStock = p?.stock || 0;

                await saveInventoryMove({
                    productId: item.productId,
                    variationId: item.variationId,
                    productDescription: item.description,
                    type: 'entry',
                    quantity: item.quantity,
                    date: new Date().toISOString(),
                    label: 'Compra',
                    observation: `Pedido de Compra #${savedId}`
                }, currentStock);
            }
        }
    } catch (error) {
        console.error("Erro ao salvar compra: ", error);
        throw error;
    }
};

const mapToDB = (p: Purchase) => ({
    supplier_id: p.supplierId,
    supplier_name: p.supplierName,
    date: p.date,
    items: p.items,
    total_value: p.totalValue,
    observation: p.observation,
    status: p.status,
    created_at: p.createdAt || new Date().toISOString()
});

const mapFromDB = (data: any): Purchase => ({
    id: String(data.id),
    supplierId: data.supplier_id,
    supplierName: data.supplier_name,
    date: data.date,
    items: data.items,
    totalValue: Number(data.total_value),
    observation: data.observation,
    status: data.status,
    createdAt: data.created_at
});
