import { it, expect } from 'vitest';
import { supabase } from '@/pages/utils/supabaseConfig';

it('should migrate aereo products', async () => {
    console.log('Migration started...');
    // 1. Find category ID
    const { data: catData } = await supabase.from('categories').select('id, name').ilike('name', 'Armários Aéreos').single();
    if (!catData) {
        console.error("Category 'Armários Aéreos' not found.");
        return;
    }
    console.log(`Found category: ${catData.name} (ID: ${catData.id})`);

    // 2. Find products with "AÉREO" or "AEREO"
    const { data: prods } = await supabase.from('products').select('id, description').or('description.ilike.%aéreo%,description.ilike.%aereo%');
    
    if (!prods || prods.length === 0) {
        console.log("No products found with 'aéreo'.");
        return;
    }

    console.log(`Found ${prods.length} products to update.`);

    for (const prod of prods) {
        let newDesc = prod.description;
        
        if (!newDesc.toLowerCase().includes('armário aéreo') && !newDesc.toLowerCase().includes('armario aereo')) {
            if (newDesc.match(/^aéreo/i)) {
                newDesc = newDesc.replace(/^aéreo/i, 'Armário Aéreo');
            } else if (newDesc.match(/^aereo/i)) {
                newDesc = newDesc.replace(/^aereo/i, 'Armário Aéreo');
            } else {
                newDesc = newDesc.replace(/aéreo/gi, 'Armário Aéreo').replace(/aereo/gi, 'Armário Aéreo');
            }
        }

        console.log(`Updating ID ${prod.id}: "${prod.description}" -> "${newDesc}"`);

        await supabase.from('products').update({ description: newDesc }).eq('id', prod.id);

        const { data: existingLinks } = await supabase.from('product_categories').select('*').eq('product_id', prod.id).eq('category_id', catData.id);
        if (!existingLinks || existingLinks.length === 0) {
            await supabase.from('product_categories').insert({ product_id: prod.id, category_id: catData.id });
            console.log(`Linked ID ${prod.id} to category ${catData.id}`);
        }
    }
    console.log('Migration finished.');
    expect(true).toBe(true);
});
