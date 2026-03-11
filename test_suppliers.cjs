const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'pdv', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Fetching products...");
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    // Check if there is any supplier data in products
    let sample = data.find(p => p.supplierId);
    console.log("Sample product with supplierId:", sample);
    
    // Check if supplier name might be stored differently like in an old 'fornecedor' field
    const pWithFornecedor = data.find(p => p.fornecedor || (p.metadata && p.metadata.fornecedor));
    console.log("Sample product with fornecedor field:", pWithFornecedor);
    
    // Save all distinct fornecedores
    let suppliers = new Set();
    data.forEach(p => {
        if (p.fornecedor) suppliers.add(p.fornecedor);
        if (p.metadata && p.metadata.fornecedor) suppliers.add(p.metadata.fornecedor);
    });
    
    console.log("All distinct suppliers found:", Array.from(suppliers));
}

check();
