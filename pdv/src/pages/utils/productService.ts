import { supabase } from "./supabaseConfig";
import Product from "../types/product.type";

const TABLE_NAME = "products";

const mapToDB = (product: Partial<Product>) => {
    return {
        code: product.code,
        description: product.description,
        category: product.category,
        unit_price: product.unitPrice,
        cost_price: product.costPrice,
        freight_type: product.freightType,
        freight_cost: product.freightCost,
        ipi_percent: product.ipiPercent,
        final_purchase_price: product.finalPurchasePrice,
        initial_stock: product.initialStock,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit,
        active: product.active,
        deleted: product.deleted,
        supplier_id: product.supplierId,
        images: product.images,
        ecommerce_description: product.ecommerceDescription,
        has_variations: product.hasVariations,
        variations: product.variations,
        item_type: product.itemType,
        fiscal: product.fiscal,
        updated_at: new Date().toISOString()
    };
};

const mapFromDB = (data: any): Product => {
    return {
        id: String(data.id),
        code: data.code,
        description: data.description,
        category: data.category,
        unitPrice: Number(data.unit_price),
        costPrice: Number(data.cost_price),
        freightType: data.freight_type || 'fixed',
        freightCost: Number(data.freight_cost),
        ipiPercent: Number(data.ipi_percent),
        finalPurchasePrice: Number(data.final_purchase_price),
        initialStock: Number(data.initial_stock),
        stock: Number(data.stock),
        minStock: Number(data.min_stock),
        unit: data.unit,
        active: data.active,
        deleted: data.deleted,
        supplierId: data.supplier_id,
        images: data.images,
        ecommerceDescription: data.ecommerce_description,
        hasVariations: data.has_variations,
        variations: data.variations,
        itemType: data.item_type || 'product',
        fiscal: data.fiscal,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*')
        .order('description', { ascending: true })
        .then(({ data, error }) => {
            if (data && !error) {
                callback(data.map(mapFromDB));
            } else if (error) {
                console.error("Erro ao buscar produtos iniciais:", error);
                callback([]);
            }
        });

    const channel = supabase.channel('products_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => {
            // Re-fetch all on any change to keep sorting simple
            supabase.from(TABLE_NAME)
                .select('*')
                .order('description', { ascending: true })
                .then(({ data }) => {
                    if (data) callback(data.map(mapFromDB));
                });
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const saveProduct = async (product: Product): Promise<void> => {
    if (product.id) {
        await updateProduct(product.id, product);
        return;
    }

    try {
        const dbProduct = mapToDB(product);
        // Supabase serial ID will handle the auto-increment
        const { error } = await supabase
            .from(TABLE_NAME)
            .insert([dbProduct]);
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao salvar o produto: ", error);
        throw error;
    }
};

export const updateProduct = async (id: string, productToUpdate: Partial<Product>): Promise<void> => {
    try {
        const dbProduct = mapToDB(productToUpdate);
        const { error } = await supabase
            .from(TABLE_NAME)
            .update(dbProduct)
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao atualizar o produto: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateProduct(id, { 
            deleted: true, 
             active: false
        });
    } catch (error) {
        console.error("Erro ao mover produto para lixeira: ", error);
        throw error;
    }
};

export const restoreProduct = async (id: string): Promise<void> => {
    try {
        await updateProduct(id, { 
            deleted: false,
            active: true
        });
    } catch (error) {
        console.error("Erro ao restaurar o produto: ", error);
        throw error;
    }
};

export const permanentDeleteProduct = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', parseInt(id));
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o produto: ", error);
        throw error;
    }
};
