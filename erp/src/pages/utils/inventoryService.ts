import { supabase } from '@/pages/utils/supabaseConfig';
import InventoryMove from "../types/inventoryMove.type";
import { updateProduct } from '@/pages/utils/productService';

const TABLE_NAME = "inventory_moves";

export const subscribeToInventoryMoves = (callback: (moves: InventoryMove[]) => void) => {
    supabase.from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: false })
        .then(({ data, error }) => {
            if (data && !error) {
                callback(data.map(mapFromDB));
            } else if (error) {
                console.error("Erro ao buscar lançamentos iniciais:", error);
                callback([]);
            }
        });

    const channel = supabase.channel('inventory_moves_changes')
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

export const saveInventoryMove = async (move: InventoryMove, currentProductStock: number): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .insert([mapToDB(move)]);

        if (error) throw error;

        // Fetch latest product data to handle variations correctly
        const { data: p } = await supabase.from('products').select('*').eq('id', move.productId).single();
        if (!p) return;

        let newTotalStock = Number(p.stock || 0);
        let updatedVariations = p.variations ? [...p.variations] : [];

        if (move.variationId && updatedVariations.length > 0) {
            const vIdx = updatedVariations.findIndex((v: any) => String(v.id) === String(move.variationId));
            if (vIdx !== -1) {
                let vStock = Number(updatedVariations[vIdx].stock || 0);
                if (move.type === 'entry') vStock += move.quantity;
                else if (move.type === 'withdrawal') vStock -= move.quantity;
                else if (move.type === 'balance') vStock = move.quantity;
                
                updatedVariations[vIdx].stock = vStock;
            }
            // If it has variations, total stock is usually sum of variations
            newTotalStock = updatedVariations.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0);
        } else {
            if (move.type === 'entry') newTotalStock += move.quantity;
            else if (move.type === 'withdrawal') newTotalStock -= move.quantity;
            else if (move.type === 'balance') newTotalStock = move.quantity;
        }

        await updateProduct(move.productId, { 
            stock: newTotalStock,
            variations: updatedVariations.length > 0 ? updatedVariations : undefined
        });
    } catch (error) {
        console.error("Erro ao salvar lançamento de estoque: ", error);
        throw error;
    }
};

export const deleteInventoryMove = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar lançamento de estoque: ", error);
        throw error;
    }
};

export const updateInventoryMove = async (id: string, updates: Partial<InventoryMove>): Promise<void> => {
    try {
        const dbUpdates: any = {};
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.unitCost !== undefined) dbUpdates.unit_cost = updates.unitCost;
        if (updates.observation !== undefined) dbUpdates.observation = updates.observation;
        if (updates.label !== undefined) dbUpdates.label = updates.label;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.parentMoveId !== undefined) dbUpdates.parent_move_id = updates.parentMoveId;

        const { error } = await supabase
            .from(TABLE_NAME)
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Erro ao atualizar lançamento de estoque:", error);
        throw error;
    }
};

export const getInventoryMoveById = async (id: string): Promise<InventoryMove | null> => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data ? mapFromDB(data) : null;
    } catch (error) {
        console.error("Erro ao buscar lançamento de estoque:", error);
        return null;
    }
};

/**
 * Fetches entry lots for a product/variation that still have positive balance (FIFO).
 */
export const getAvailableLots = async (productId: string, variationId?: string): Promise<(InventoryMove & { balance: number })[]> => {
    try {
        // 1. Get all entries
        let query = supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('product_id', productId)
            .eq('type', 'entry')
            .order('date', { ascending: true }); // Important: FIFO

        if (variationId) query = query.eq('variation_id', variationId);
        else query = query.is('variation_id', null);

        const { data: entries, error: entryError } = await query;
        if (entryError) throw entryError;

        // 2. Get all withdrawals linked to lots
        let withdrawalQuery = supabase
            .from(TABLE_NAME)
            .select('parent_move_id, quantity')
            .eq('type', 'withdrawal')
            .neq('parent_move_id', null);
        
        const { data: withdrawals, error: withdrawalError } = await withdrawalQuery;
        if (withdrawalError) throw withdrawalError;

        // 3. Calculate balance per entry
        const usedByLot: Record<string, number> = {};
        withdrawals?.forEach(w => {
            usedByLot[w.parent_move_id] = (usedByLot[w.parent_move_id] || 0) + Number(w.quantity);
        });

        const availableLots = (entries || [])
            .map(e => {
                const move = mapFromDB(e);
                const used = usedByLot[e.id] || 0;
                return { ...move, balance: move.quantity - used };
            })
            .filter(lot => lot.balance > 0);

        return availableLots;
    } catch (error) {
        console.error("Erro ao buscar lotes disponíveis:", error);
        return [];
    }
};

const mapToDB = (move: InventoryMove) => ({
    product_id: move.productId,
    variation_id: move.variationId,
    product_description: move.productDescription,
    type: move.type,
    quantity: move.quantity,
    date: move.date,
    label: move.label,
    unit_cost: move.unitCost,
    parent_move_id: move.parentMoveId,
    observation: move.observation
});

const mapFromDB = (data: any): InventoryMove => ({
    id: String(data.id),
    productId: data.product_id,
    variationId: data.variation_id,
    productDescription: data.product_description,
    type: data.type,
    quantity: Number(data.quantity),
    date: data.date,
    label: data.label,
    unitCost: data.unit_cost ? Number(data.unit_cost) : undefined,
    parentMoveId: data.parent_move_id,
    observation: data.observation,
    createdAt: data.created_at
});
