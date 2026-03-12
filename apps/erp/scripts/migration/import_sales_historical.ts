import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const SALES_CSV = 'c:\\Users\\mathe\\OneDrive\\Área de Trabalho\\projetos\\moveismorantehub\\vendas_2026-03-12-06-15-16.csv';
const BACKUP_PATH = 'c:\\Users\\mathe\\Downloads\\backup_276708598d7dede88d76246a2c16e19c6c420877f67f0aa88d8cb9061695896c';
const PAYMENTS_CSV = path.join(BACKUP_PATH, 'contas_receber.csv');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- HELPERS ---
function parsePrice(val: string) {
    if (!val) return 0;
    // Handle formats like "1.234,56" or "1234,56"
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
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

function formatDate(val: string) {
    if (!val) return new Date().toISOString();
    // 07/05/2025 -> 2025-05-07T12:00:00.000Z
    const parts = val.split('/');
    if (parts.length < 3) return new Date().toISOString();
    const [d, m, y] = parts;
    return new Date(`${y}-${m}-${d}T12:00:00Z`).toISOString();
}

async function run() {
    console.log('--- STARTING HISTORICAL SALES IMPORT ---');

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Read Payments Mapping
    console.log('Reading payments mapping...');
    if (!fs.existsSync(PAYMENTS_CSV)) {
        console.warn(`Payments CSV not found at ${PAYMENTS_CSV}. Skipping payment matching.`);
    }
    
    const orderToPayment = new Map<string, string>();
    if (fs.existsSync(PAYMENTS_CSV)) {
        const paymentsContent = fs.readFileSync(PAYMENTS_CSV, 'utf-8');
        const paymentLines = paymentsContent.split('\n');
        const header = parseCSVLine(paymentLines[0]);
        const histIdx = header.indexOf('Histórico');
        const methodIdx = header.indexOf('Forma pagamento');

        for (let i = 1; i < paymentLines.length; i++) {
            const cols = parseCSVLine(paymentLines[i]);
            if (cols.length <= histIdx || cols.length <= methodIdx) continue;
            
            const history = cols[histIdx] || '';
            const method = cols[methodIdx] || '';
            const match = history.match(/nº (\d+)/i);
            if (match && method) {
                const orderNum = match[1];
                if (!orderToPayment.has(orderNum) || orderToPayment.get(orderNum) === 'DINHEIRO') {
                    orderToPayment.set(orderNum, method);
                }
            }
        }
        console.log(`Matched ${orderToPayment.size} order payment methods.`);
    }

    // 2. Read Sales CSV
    console.log('Reading sales CSV...');
    const salesContent = fs.readFileSync(SALES_CSV, 'utf-8');
    const salesLines = salesContent.split('\n');
    if (salesLines.length < 2) throw new Error("Empty sales CSV.");

    const salesHeader = parseCSVLine(salesLines[0]);
    const h = (name: string) => salesHeader.indexOf(name);
    
    const idx = {
        orderId: h('ID'),
        orderNum: h('N° do Pedido'),
        date: h('Data'),
        contactId: h('ID contato'),
        contactName: h('Nome do contato'),
        cpf: h('Cpf/Cnpj'),
        address: h('Endereco'),
        bairro: h('Bairro'),
        municipio: h('Município'),
        cep: h('Cep'),
        estado: h('Estado'),
        email: h('E-mail'),
        phone: h('Telefone'),
        discOrder: h('Desconto pedido'),
        freight: h('Frete'),
        obs: h('Observações'),
        situation: h('Situação'),
        prodId: h('ID produto'),
        desc: h('Descrição'),
        qty: h('Quantidade'),
        price: h('Valor unitário'),
        cost: h('Preço de Custo'),
        total: h('Preço Total'),
        seller: h('Vendedor'),
        origin: h('Loja virtual')
    };

    // 3. Fetch Existing Data
    console.log('Fetching existing data from DB...');
    const { data: existingOrders } = await supabase.from('orders').select('order_data');
    const existingNums = new Set((existingOrders || []).map(o => String((o.order_data as any).orderIndex)));
    console.log(`Found ${existingNums.size} existing orders in DB to skip.`);

    const { data: allProducts } = await supabase.from('products').select('*');
    const productMap = new Map<string, any>();
    (allProducts || []).forEach(p => {
        productMap.set(p.description.toLowerCase().trim(), p);
    });

    const { data: allPeople } = await supabase.from('people').select('*');
    const peopleMap = new Map<string, any>();
    (allPeople || []).forEach(p => {
        peopleMap.set(p.full_name.toLowerCase().trim(), p);
    });

    let consumidorFinal = peopleMap.get('consumidor final');
    if (!consumidorFinal) {
        console.log('Creating Consumidor Final customer...');
        const { data: created } = await supabase.from('people').insert([{
            full_name: 'Consumidor Final',
            person_type: 'customers',
            active: true,
            updated_at: new Date().toISOString()
        }]).select().single();
        consumidorFinal = created;
    }

    // 4. Group by Order
    const ordersMap = new Map<string, any>();
    for (let i = 1; i < salesLines.length; i++) {
        const line = salesLines[i].trim();
        if (!line) continue;
        const cols = parseCSVLine(line);
        const orderNum = cols[idx.orderNum];
        if (!orderNum || existingNums.has(orderNum)) continue;

        if (!ordersMap.has(orderNum)) {
            ordersMap.set(orderNum, {
                row: cols,
                items: []
            });
        }
        ordersMap.get(orderNum).items.push(cols);
    }
    console.log(`Orders to process: ${ordersMap.size}`);

    // 5. Process and Insert
    let successCount = 0;
    let errorCount = 0;
    let limit = 5;

    for (const [orderNum, data] of ordersMap.entries()) {
        if (successCount >= limit) break;
        try {
            const mainRow = data.row;
            const itemsRows = data.items;

            // Resolve Customer
            let customer = consumidorFinal;
            const customerName = mainRow[idx.contactName]?.trim();
            if (customerName && customerName.toLowerCase() !== 'consumidor final') {
                if (peopleMap.has(customerName.toLowerCase())) {
                    customer = peopleMap.get(customerName.toLowerCase());
                } else {
                    const { data: newCust } = await supabase.from('people').insert([{
                        full_name: customerName,
                        person_type: 'customers',
                        cpf_cnpj: mainRow[idx.cpf],
                        email: mainRow[idx.email],
                        phone: mainRow[idx.phone],
                        address: `${mainRow[idx.address] || ''}, ${mainRow[idx.bairro] || ''}, ${mainRow[idx.municipio] || ''}/${mainRow[idx.estado] || ''} CEP: ${mainRow[idx.cep] || ''}`,
                        active: true,
                        updated_at: new Date().toISOString()
                    }]).select().single();
                    
                    if (newCust) {
                        customer = newCust;
                        peopleMap.set(customerName.toLowerCase(), customer);
                    }
                }
            }

            const status = mainRow[idx.situation] === 'Cancelado' ? 'cancelled' : 'fulfilled';
            const dateStr = formatDate(mainRow[idx.date]);
            const paymentMethod = orderToPayment.get(String(orderNum)) || 'Não informado';

            // Items and Stock Moves
            const items: any[] = [];
            const inventoryMoves: any[] = [];
            const priceHistories: any[] = [];

            let totalItemsValue = 0;
            let totalItemsCost = 0;

            for (const itemRow of itemsRows) {
                const desc = itemRow[idx.desc].trim();
                const matchedProduct = productMap.get(desc.toLowerCase());
                const productId = matchedProduct?.id;
                
                const quantity = parsePrice(itemRow[idx.qty]);
                const unitPrice = parsePrice(itemRow[idx.price]);
                const costPrice = parsePrice(itemRow[idx.cost]);
                
                totalItemsValue += quantity * unitPrice;
                totalItemsCost += quantity * costPrice;

                items.push({
                    productId,
                    description: desc,
                    quantity,
                    unitPrice,
                    costPrice,
                    unitDiscount: parsePrice(itemRow[idx.discOrder]), // Simplification: apply discount proportionally if needed, but CSV has 'Desconto item'? No, 'Desconto pedido'.
                    discountType: 'fixed',
                    handlingType: 'stock',
                    condition: desc.toLowerCase().includes('salvado') ? 'salvado' : (desc.toLowerCase().includes('usado') ? 'usado' : 'novo')
                });

                if (productId) {
                    if (status === 'fulfilled') {
                        inventoryMoves.push({
                            product_id: productId,
                            product_description: desc,
                            type: 'withdrawal',
                            quantity: quantity,
                            date: dateStr,
                            label: `Pedido #${orderNum} (Importado)`,
                            unit_cost: costPrice,
                            created_at: new Date().toISOString()
                        });
                    }

                    priceHistories.push({
                        product_id: productId,
                        old_unit_price: matchedProduct.unit_price || 0,
                        new_unit_price: unitPrice,
                        old_cost_price: matchedProduct.cost_price || 0,
                        new_cost_price: costPrice,
                        change_type: 'both',
                        created_at: dateStr
                    });
                }
            }

            const orderData = {
                orderType: 'sale',
                status: status,
                orderIndex: parseInt(String(orderNum)),
                date: dateStr,
                seller: mainRow[idx.seller] || 'Bling Import',
                observation: mainRow[idx.obs],
                customerData: {
                    fullName: customer.full_name,
                    phone: customer.phone || '',
                    email: customer.email || '',
                    cpfCnpj: customer.cpf_cnpj || '',
                    fullAddress: typeof customer.address === 'object' ? customer.address : { street: customer.address || '' }
                },
                items: items,
                itemsSummary: {
                    totalQuantity: items.reduce((acc, i) => acc + i.quantity, 0),
                    itemsSubtotal: totalItemsValue,
                    totalFixedDiscount: parsePrice(mainRow[idx.discOrder]),
                    itemsTotalValue: parsePrice(mainRow[idx.total]),
                    totalItemsCost: totalItemsCost
                },
                shipping: {
                    value: parsePrice(mainRow[idx.freight]),
                    method: 'Importado',
                    address: typeof customer.address === 'object' ? customer.address : { street: customer.address || '' }
                },
                payments: [{
                    method: paymentMethod,
                    value: parsePrice(mainRow[idx.total]),
                    status: status === 'fulfilled' ? 'paid' : 'pending',
                    date: dateStr
                }],
                paymentsSummary: {
                    totalPaid: status === 'fulfilled' ? parsePrice(mainRow[idx.total]) : 0,
                    totalPending: status === 'fulfilled' ? 0 : parsePrice(mainRow[idx.total]),
                    totalValue: parsePrice(mainRow[idx.total])
                },
                stockProcessed: status === 'fulfilled',
                marketingOrigin: mainRow[idx.origin] || 'Bling'
            };

            const { error: orderErr } = await supabase.from('orders').insert([{
                order_data: orderData,
                updated_at: new Date().toISOString()
            }]);

            if (orderErr) throw orderErr;

            if (inventoryMoves.length > 0) {
                await supabase.from('inventory_moves').insert(inventoryMoves);
            }

            if (priceHistories.length > 0) {
                await supabase.from('product_price_history').insert(priceHistories);
            }

            successCount++;
            if (successCount % 50 === 0) console.log(`Processed ${successCount} orders...`);

        } catch (err) {
            console.error(`Error processing order #${orderNum}:`, err);
            errorCount++;
        }
    }

    console.log('--- IMPORT COMPLETED ---');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
}

run().catch(console.error);
