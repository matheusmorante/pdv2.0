import { supabase } from "./supabaseConfig";
import Product from "../types/product.type";

const TABLE_NAME = "products";

const mapToDB = (product: Partial<Product>) => {
    return {
        code: product.code,
        description: product.description,
        brand: product.brand,
        category: product.category,
        condition: product.condition || '',
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
        brand: data.brand,
        category: data.category,
        condition: data.condition || '',
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
        categoryIds: data.product_categories?.map((pc: any) => pc.category_id) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    // Initial fetch
    supabase.from(TABLE_NAME)
        .select('*, product_categories(category_id)')
        .order('description', { ascending: true })
        .then(({ data, error }: { data: any, error: any }) => {
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
                .select('*, product_categories(category_id)')
                .order('description', { ascending: true })
                .then(({ data }: { data: any }) => {
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
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([dbProduct])
            .select();

        if (error) throw error;

        if (data && data[0] && product.categoryIds && product.categoryIds.length > 0) {
            const newId = data[0].id;
            const links = product.categoryIds.map(cid => ({ product_id: newId, category_id: cid }));
            await supabase.from('product_categories').insert(links);
        }
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
            .eq('id', id);

        if (error) throw error;

        if (productToUpdate.categoryIds !== undefined) {
            await supabase.from('product_categories').delete().eq('product_id', id);
            if (productToUpdate.categoryIds.length > 0) {
                const links = productToUpdate.categoryIds.map(cid => ({ product_id: id, category_id: cid }));
                await supabase.from('product_categories').insert(links);
            }
        }
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
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Erro ao deletar permanentemente o produto: ", error);
        throw error;
    }
};
