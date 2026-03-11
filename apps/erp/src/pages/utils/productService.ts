import { supabase } from "./supabaseConfig";
import Product from "../types/product.type";

const TABLE_NAME = "products";

const mapToDB = (product: Partial<Product>) => {
    const data: any = {
        updated_at: new Date().toISOString()
    };

    if (product.code !== undefined) data.code = product.code;
    if (product.description !== undefined) data.description = product.description;
    if (product.brand !== undefined) data.brand = product.brand;
    if (product.category !== undefined) data.category = product.category;
    if (product.condition !== undefined) data.condition = product.condition;
    if (product.unitPrice !== undefined) data.unit_price = product.unitPrice;
    if (product.costPrice !== undefined) data.cost_price = product.costPrice;
    if (product.freightType !== undefined) data.freight_type = product.freightType;
    if (product.freightCost !== undefined) data.freight_cost = product.freightCost;
    if (product.ipiPercent !== undefined) data.ipi_percent = product.ipiPercent;
    if (product.finalPurchasePrice !== undefined) data.final_purchase_price = product.finalPurchasePrice;
    if (product.initialStock !== undefined) data.initial_stock = product.initialStock;
    if (product.stock !== undefined) data.stock = product.stock;
    if (product.minStock !== undefined) data.min_stock = product.minStock;
    if (product.unit !== undefined) data.unit = product.unit;
    if (product.active !== undefined) data.active = product.active;
    if (product.isDraft !== undefined) data.is_draft = product.isDraft;
    if (product.deleted !== undefined) data.deleted = product.deleted;
    if (product.supplierId !== undefined) data.supplier_id = product.supplierId;
    if (product.images !== undefined) data.images = product.images;
    if (product.ecommerceDescription !== undefined) data.ecommerce_description = product.ecommerceDescription;
    if (product.whatsappDescription !== undefined) data.whatsapp_description = product.whatsappDescription;
    if (product.whatsappTemplate !== undefined) data.whatsapp_template = product.whatsappTemplate;
    if (product.ecommerceTemplate !== undefined) data.ecommerce_template = product.ecommerceTemplate;
    if (product.hasVariations !== undefined) data.has_variations = product.hasVariations;
    if (product.variations !== undefined) data.variations = product.variations;
    if (product.itemType !== undefined) data.item_type = product.itemType;
    if (product.fiscal !== undefined) data.fiscal = product.fiscal;
    if (product.notificationConfig !== undefined) data.notification_config = product.notificationConfig;
<<<<<<< HEAD:pdv/src/pages/utils/productService.ts
    if (product.isCombo !== undefined) data.is_combo = product.isCombo;
    if (product.comboItems !== undefined) data.combo_items = product.comboItems;
=======
    
    // New fields
    if (product.width !== undefined) data.width = product.width;
    if (product.height !== undefined) data.height = product.height;
    if (product.depth !== undefined) data.depth = product.depth;
    if (product.extraDimensions !== undefined) data.extra_dimensions = product.extraDimensions;
    if (product.line !== undefined) data.line = product.line;
    if (product.mainDifferential !== undefined) data.main_differential = product.mainDifferential;
    if (product.material !== undefined) data.material = product.material;
    if (product.colors !== undefined) data.colors = product.colors;
    if (product.notIncluded !== undefined) data.not_included = product.notIncluded;
    if (product.isCombo !== undefined) data.is_combo = product.isCombo;
    if (product.comboItems !== undefined) data.combo_items = product.comboItems;
    if (product.ecommerceTemplate !== undefined) data.ecommerce_template = product.ecommerceTemplate;
    if (product.whatsappDescription !== undefined) data.whatsapp_description = product.whatsappDescription;
    if (product.whatsappTemplate !== undefined) data.whatsapp_template = product.whatsappTemplate;
>>>>>>> dev:apps/erp/src/pages/utils/productService.ts

    return data;
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
        isDraft: data.is_draft,
        deleted: data.deleted,
        supplierId: data.supplier_id,
        images: data.images,
        ecommerceDescription: data.ecommerce_description,
        whatsappDescription: data.whatsapp_description,
        whatsappTemplate: data.whatsapp_template,
        ecommerceTemplate: data.ecommerce_template,
        hasVariations: data.has_variations,
        variations: data.variations,
        itemType: data.item_type || 'product',
        fiscal: data.fiscal,
        notificationConfig: data.notification_config,
        isCombo: data.is_combo || false,
        comboItems: data.combo_items || [],
        categoryIds: data.product_categories?.map((pc: any) => pc.category_id) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        
        // New fields
        width: data.width,
        height: data.height,
        depth: data.depth,
        extraDimensions: data.extra_dimensions || [],
        line: data.line,
        mainDifferential: data.main_differential,
        material: data.material,
        colors: data.colors,
        notIncluded: data.not_included,
        isCombo: data.is_combo,
        comboItems: data.combo_items || [],
        ecommerceTemplate: data.ecommerce_template,
        whatsappDescription: data.whatsapp_description,
        whatsappTemplate: data.whatsapp_template
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

export const saveProduct = async (product: Product): Promise<string> => {
    if (product.id) {
        await updateProduct(product.id, product);
        return product.id;
    }

    try {
        const dbProduct = mapToDB(product);
        // Supabase serial ID will handle the auto-increment
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([dbProduct])
            .select();

        if (error) throw error;

        if (data && data[0]) {
            const newId = data[0].id;
            if (product.categoryIds && product.categoryIds.length > 0) {
                const links = product.categoryIds.map(cid => ({ product_id: newId, category_id: cid }));
                await supabase.from('product_categories').insert(links);
            }
            return String(newId);
        }
<<<<<<< HEAD:pdv/src/pages/utils/productService.ts
    } catch (error: any) {
        console.error("Erro ao salvar o produto:", error.message || error);
        if (error.details) console.error("Detalhes do erro:", error.details);
        if (error.hint) console.error("Dica:", error.hint);
=======
        return "";
    } catch (error) {
        console.error("Erro ao salvar o produto: ", error);
>>>>>>> dev:apps/erp/src/pages/utils/productService.ts
        throw error;
    }
};

export const updateProduct = async (id: string, productToUpdate: Partial<Product>): Promise<void> => {
    try {
        // Fetch current product for history log
        const { data: currentItem, error: fetchError } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        const dbProduct = mapToDB(productToUpdate);
        const { error } = await supabase
            .from(TABLE_NAME)
            .update(dbProduct)
            .eq('id', id);

        if (error) throw error;

        // Price History Logic
        const oldUnitPrice = Number(currentItem.unit_price);
        const newUnitPrice = productToUpdate.unitPrice !== undefined ? Number(productToUpdate.unitPrice) : oldUnitPrice;
        const oldCostPrice = Number(currentItem.cost_price);
        const newCostPrice = productToUpdate.costPrice !== undefined ? Number(productToUpdate.costPrice) : oldCostPrice;

        if (oldUnitPrice !== newUnitPrice || oldCostPrice !== newCostPrice) {
            let changeType = 'both';
            if (oldUnitPrice !== newUnitPrice && oldCostPrice === newCostPrice) changeType = 'unit_price';
            else if (oldUnitPrice === newUnitPrice && oldCostPrice !== newCostPrice) changeType = 'cost_price';

            await supabase.from('product_price_history').insert([{
                product_id: id,
                old_unit_price: oldUnitPrice,
                new_unit_price: newUnitPrice,
                old_cost_price: oldCostPrice,
                new_cost_price: newCostPrice,
                change_type: changeType
            }]);
        }

        if (productToUpdate.categoryIds !== undefined) {
            await supabase.from('product_categories').delete().eq('product_id', id);
            if (productToUpdate.categoryIds.length > 0) {
                const links = productToUpdate.categoryIds.map(cid => ({ product_id: id, category_id: cid }));
                await supabase.from('product_categories').insert(links);
            }
        }
    } catch (error: any) {
        console.error("Erro ao atualizar o produto:", error.message || error);
        if (error.details) console.error("Detalhes do erro:", error.details);
        if (error.hint) console.error("Dica:", error.hint);
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

export const saveVariation = async (productId: string, variation: any): Promise<void> => {
    try {
        const { data: parent, error: fetchError } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', productId)
            .single();

        if (fetchError) throw fetchError;
        if (!parent) throw new Error("Produto pai não encontrado.");

        const variations = parent.variations || [];
        const index = variations.findIndex((v: any) => v.id === variation.id);

        if (index === -1) throw new Error("Variação não encontrada.");

        // Price History Logic for Variation
        const oldVar = variations[index];
        const oldUnitPrice = Number(oldVar.unitPrice);
        const newUnitPrice = Number(variation.unitPrice);
        const oldCostPrice = Number(oldVar.costPrice);
        const newCostPrice = Number(variation.costPrice);

        if (oldUnitPrice !== newUnitPrice || oldCostPrice !== newCostPrice) {
            let changeType = 'both';
            if (oldUnitPrice !== newUnitPrice && oldCostPrice === newCostPrice) changeType = 'unit_price';
            else if (oldUnitPrice === newUnitPrice && oldCostPrice !== newCostPrice) changeType = 'cost_price';

            await supabase.from('product_price_history').insert([{
                product_id: productId,
                variation_id: variation.id,
                old_unit_price: oldUnitPrice,
                new_unit_price: newUnitPrice,
                old_cost_price: oldCostPrice,
                new_cost_price: newCostPrice,
                change_type: changeType
            }]);
        }

        variations[index] = variation;

        const { error: updateError } = await supabase
            .from(TABLE_NAME)
            .update({ variations, updated_at: new Date().toISOString() })
            .eq('id', productId);

        if (updateError) throw updateError;
    } catch (error) {
        console.error("Erro ao salvar variação: ", error);
        throw error;
    }
};

/**
 * Sincroniza fotos e descrições do catálogo do WhatsApp para um produto existente no ERP
 */
export const syncFromWhatsApp = async (whatsappProduct: any): Promise<string> => {
    try {
        let existingProduct = null;

        // 1. Tentar encontrar pelo Código correspondente ao Retailer ID
        if (whatsappProduct.retailer_id) {
            const { data } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('code', whatsappProduct.retailer_id)
                .eq('deleted', false)
                .limit(1);
            if (data && data.length > 0) existingProduct = data[0];
        }

        // 2. Tentar encontrar pelo Nome (Description) - Busca Flexível
        if (!existingProduct && whatsappProduct.name) {
            // Tenta achar contenha o nome inteiro
            let { data } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .ilike('description', `%${whatsappProduct.name}%`)
                .eq('deleted', false)
                .limit(1);
                
            if (data && data.length > 0) {
                existingProduct = data[0];
            } else {
                // Se não achou exato/inteiro, pega as 2 primeiras palavras-chave (ex: "Guarda Roupa") para achar semelhante
                const words = whatsappProduct.name.split(' ').filter((w: string) => w.length > 2);
                if (words.length >= 2) {
                    const partialPattern = `%${words[0]}%${words[1]}%`;
                    const { data: partialData } = await supabase
                        .from(TABLE_NAME)
                        .select('*')
                        .ilike('description', partialPattern)
                        .eq('deleted', false)
                        .limit(1);
                        
                    if (partialData && partialData.length > 0) existingProduct = partialData[0];
                }
            }
        }

        if (existingProduct) {
            // Produto encontrado! Vamos mesclar as imagens
            let currentImages = existingProduct.images || [];
            
            // Adiciona a imagem do WhatsApp no topo, caso ela exista e já não esteja na lista
            if (whatsappProduct.image_url && !currentImages.includes(whatsappProduct.image_url)) {
                currentImages = [whatsappProduct.image_url, ...currentImages];
            }

            // Atualiza o produto com a nova imagem e descrição do WhatsApp
            await updateProduct(existingProduct.id, {
                images: currentImages,
                whatsappDescription: whatsappProduct.description || existingProduct.whatsapp_description,
            });
            
            return String(existingProduct.id);
        } else {
            // Produto NÃO encontrado! Vamos criar um novo e importar os dados do WhatsApp
            const newProduct: Partial<Product> = {
                description: whatsappProduct.name,
                unitPrice: Number(whatsappProduct.price.replace(/[^0-9.-]+/g, "")),
                images: whatsappProduct.image_url ? [whatsappProduct.image_url] : [],
                whatsappDescription: whatsappProduct.description,
                isDraft: true, // Sempre como rascunho para o usuário revisar depois
                active: true,
                itemType: 'product',
                brand: 'Móveis Morante',
                condition: 'novo',
                code: whatsappProduct.retailer_id
            };
            
            return await saveProduct(newProduct as Product);
        }
        
    } catch (error) {
        console.error("Erro ao sincronizar do WhatsApp:", error);
        throw error;
    }
};
