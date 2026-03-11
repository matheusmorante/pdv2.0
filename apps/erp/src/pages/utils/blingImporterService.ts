import { supabase } from "./supabaseConfig";
import Product from "../types/product.type";
import Person from "../types/person.type";

export interface BlingImportResult {
    totalRead: number;
    productsInserted: number;
    suppliersCreated: number;
    errors: string[];
}

export interface BlingPeopleImportResult {
    totalRead: number;
    peopleCreated: number;
    peopleUpdated: number;
    errors: string[];
}

function parseCSVLine(line: string) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
}

export const importBlingCSV = async (csvContent: string): Promise<BlingImportResult> => {
    const lines = csvContent.split('\n');
    if (lines.length < 2) throw new Error("Arquivo CSV vazio ou inválido.");

    const header = parseCSVLine(lines[0]);
    
    const h = (name: string) => {
        const idx = header.indexOf(name);
        if (idx === -1) {
            return header.findIndex(col => col.toLowerCase().includes(name.toLowerCase()));
        }
        return idx;
    };

    const idx = {
        code: h('Código'),
        desc: h('Descrição'),
        unit: h('Unidade'),
        price: h('Preço'),
        cost: h('Preço de custo'),
        stock: h('Estoque'),
        minStock: h('Estoque mínimo'),
        parent: h('Código Pai'),
        brand: h('Marca'),
        cat: h('Categoria do produto'),
        situation: h('Situação'),
        supplier: h('Fornecedor'),
        condition: h('Condição')
    };

    const rawProducts: any[] = [];
    const uniqueSuppliers = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        const getVal = (colIdx: number) => (colIdx !== -1 && cols[colIdx]) ? cols[colIdx].trim() : '';

        const supplierName = getVal(idx.supplier);
        if (supplierName) uniqueSuppliers.add(supplierName);

        rawProducts.push({
            code: getVal(idx.code),
            description: getVal(idx.desc),
            unit: getVal(idx.unit),
            price: parseFloat(getVal(idx.price).replace('.', '').replace(',', '.')) || 0,
            cost: parseFloat(getVal(idx.cost).replace('.', '').replace(',', '.')) || 0,
            stock: parseFloat(getVal(idx.stock).replace('.', '').replace(',', '.')) || 0,
            minStock: parseFloat(getVal(idx.minStock).replace('.', '').replace(',', '.')) || 0,
            parentCode: getVal(idx.parent),
            brand: getVal(idx.brand),
            category: getVal(idx.cat),
            active: getVal(idx.situation).toLowerCase() === 'ativo',
            supplierName: supplierName,
            condition: getVal(idx.condition).toLowerCase()
        });
    }

    // 1. Process Suppliers
    const supplierMap = new Map<string, string>();
    let suppliersCreated = 0;

    if (uniqueSuppliers.size > 0) {
        // Fetch existing suppliers to avoid duplicates
        const { data: existingSuppliers } = await supabase
            .from('people')
            .select('id, full_name')
            .eq('person_type', 'suppliers');

        const existingMap = new Map((existingSuppliers || []).map(s => [s.full_name.toLowerCase(), s.id]));

        const suppliersToInsert = Array.from(uniqueSuppliers)
            .filter(name => !existingMap.has(name.toLowerCase()))
            .map(name => ({
                person_type: 'suppliers',
                full_name: name,
                active: true,
                updated_at: new Date().toISOString()
            }));

        if (suppliersToInsert.length > 0) {
            const { data: inserted, error: supplierError } = await supabase
                .from('people')
                .insert(suppliersToInsert)
                .select();

            if (supplierError) console.error("Erro ao inserir fornecedores:", supplierError);
            
            if (inserted) {
                inserted.forEach(s => supplierMap.set(s.full_name.toLowerCase(), s.id));
                suppliersCreated = inserted.length;
            }
        }

        // Add existing ones to the map too
        existingMap.forEach((id, name) => supplierMap.set(name, id));
    }

    // 2. Group Variations
    const finalProductsMap = new Map();

    // First pass: Parents or simple products
    rawProducts.forEach(p => {
        if (!p.parentCode) {
            finalProductsMap.set(p.code, {
                ...p,
                has_variations: false,
                variations: []
            });
        }
    });

    // Second pass: Variations
    rawProducts.forEach(p => {
        if (p.parentCode) {
            const parent = finalProductsMap.get(p.parentCode);
            if (parent) {
                parent.has_variations = true;
                parent.variations.push({
                    sku: p.code,
                    name: p.description,
                    stock: p.stock,
                    unitPrice: p.price,
                    costPrice: p.cost,
                    active: p.active,
                    attributes: []
                });
            } else {
                // Orphan variation becomes simple product
                finalProductsMap.set(p.code, {
                    ...p,
                    has_variations: false,
                    variations: []
                });
            }
        }
    });

    // 3. Prepare items for insertion
    const productsToInsert = Array.from(finalProductsMap.values()).map(p => ({
        code: p.code,
        description: p.description,
        brand: p.brand,
        category: p.category,
        unit_price: p.price,
        cost_price: p.cost,
        stock: p.stock,
        min_stock: p.minStock,
        unit: p.unit || 'un',
        active: p.active,
        has_variations: p.has_variations,
        variations: p.variations,
        item_type: 'product',
        supplier_id: p.supplierName ? supplierMap.get(p.supplierName.toLowerCase()) : null,
        condition: ['novo', 'usado', 'salvado'].includes(p.condition) ? p.condition : (p.description.toLowerCase().includes('salvado') ? 'salvado' : (p.description.toLowerCase().includes('usado') ? 'usado' : 'novo')),
        updated_at: new Date().toISOString()
    }));

    // 4. Batch Insert
    let productsInserted = 0;
    const errors: string[] = [];
    const chunkSize = 50;

    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
        const chunk = productsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'code' });
        
        if (error) {
            errors.push(`Erro no lote ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
        } else {
            productsInserted += chunk.length;
        }
    }

    return {
        totalRead: rawProducts.length,
        productsInserted,
        suppliersCreated,
        errors
    };
};

export const importBlingPeopleCSV = async (csvContent: string, type: 'suppliers' | 'customers' = 'suppliers'): Promise<BlingPeopleImportResult> => {
    const lines = csvContent.split('\n');
    if (lines.length < 2) throw new Error("Arquivo CSV vazio ou inválido.");

    const header = parseCSVLine(lines[0]);
    
    const h = (name: string) => {
        const idx = header.indexOf(name);
        if (idx === -1) {
            return header.findIndex(col => col.toLowerCase().includes(name.toLowerCase()));
        }
        return idx;
    };

    const idx = {
        code: h('Código'),
        name: h('Nome'),
        fantasy: h('Fantasia'),
        cpfCnpj: h('CPF/CNPJ'),
        address: h('Endereço'),
        number: h('Número'),
        neighborhood: h('Bairro'),
        cep: h('CEP'),
        city: h('Cidade'),
        uf: h('UF'),
        phone: h('Fone'),
        cellphone: h('Celular'),
        email: h('E-mail')
    };

    const peopleToProcess: any[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        if (cols.length < 2) continue;

        const getVal = (colIdx: number) => (colIdx !== -1 && cols[colIdx]) ? cols[colIdx].trim() : '';

        const name = getVal(idx.name) || getVal(idx.fantasy);
        if (!name) continue;

        peopleToProcess.push({
            code: getVal(idx.code),
            fullName: name,
            cpfCnpj: getVal(idx.cpfCnpj),
            email: getVal(idx.email),
            phone: getVal(idx.cellphone) || getVal(idx.phone),
            address: `${getVal(idx.address)}, ${getVal(idx.number)} - ${getVal(idx.neighborhood)} - ${getVal(idx.city)}/${getVal(idx.uf)} - CEP: ${getVal(idx.cep)}`,
            person_type: type,
            active: true,
            updated_at: new Date().toISOString()
        });
    }

    let peopleCreated = 0;
    const errors: string[] = [];
    
    // 1. Fetch existing people of this type to avoid duplicates
    const { data: existingPeople } = await supabase
        .from('people')
        .select('full_name')
        .eq('person_type', type);
    
    const existingNames = new Set((existingPeople || []).map(p => p.full_name.toLowerCase()));

    const toInsert = peopleToProcess
        .filter(p => !existingNames.has(p.fullName.toLowerCase()))
        .map(p => ({
            full_name: p.fullName,
            cpf_cnpj: p.cpfCnpj,
            email: p.email,
            phone: p.phone,
            address: p.address,
            person_type: type,
            active: true,
            updated_at: new Date().toISOString()
        }));

    if (toInsert.length > 0) {
        const chunkSize = 50;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
            const chunk = toInsert.slice(i, i + chunkSize);
            const { error } = await supabase
                .from('people')
                .insert(chunk);
            
            if (error) {
                errors.push(`Erro no lote ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
            } else {
                peopleCreated += chunk.length;
            }
        }
    }

    return {
        totalRead: peopleToProcess.length,
        peopleCreated,
        peopleUpdated: 0,
        errors
    };
};


