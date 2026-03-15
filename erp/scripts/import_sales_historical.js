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

function parsePrice(val) {
    if (!val) return 0;
    return parseFloat(String(val).replace(/\./g, '').replace(',', '.')) || 0;
}

function parseCSVLine(line) {
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

function formatDate(val) {
    if (!val) return new Date().toISOString();
    const parts = val.split('/');
    if (parts.length < 3) return new Date().toISOString();
    const [d, m, y] = parts;
    return new Date(`${y}-${m}-${d}T12:00:00Z`).toISOString();
}

async function run() {
    fs.writeFileSync('debug_start.txt', 'started at ' + new Date().toISOString());
    console.log('--- SCRIPT STARTING ---');
    console.log('--- STARTING HISTORICAL SALES IMPORT (.JS) ---');

    // 1. Read Payments
    const orderToPayment = new Map();
    if (fs.existsSync(PAYMENTS_CSV)) {
        console.log('Reading payments mapping...');
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

    // 2. Read Sales
    console.log('Reading sales CSV...');
    const salesContent = fs.readFileSync(SALES_CSV, 'utf-8');
    const salesLines = salesContent.split('\n');
    const salesHeader = parseCSVLine(salesLines[0]);
    const h = (name) => salesHeader.indexOf(name);
    const idx = {
        orderNum: h('N° do Pedido'),
        date: h('Data'),
        contactName: h('Nome do contato'),
        cpf: h('Cpf/Cnpj'), email: h('E-mail'), phone: h('Telefone'),
        address: h('Endereco'), bairro: h('Bairro'), municipio: h('Município'), cep: h('Cep'), estado: h('Estado'),
        discOrder: h('Desconto pedido'), freight: h('Frete'), obs: h('Observações'),
        situation: h('Situação'), prodId: h('ID produto'), desc: h('Descrição'),
        qty: h('Quantidade'), price: h('Valor unitário'), cost: h('Preço de Custo'),
        total: h('Preço Total'), seller: h('Vendedor'), origin: h('Loja virtual')
    };

    // 3. Fetch Existing
    console.log('Fetching database records...');
    const { data: existingOrders } = await supabase.from('orders').select('order_data');
    const existingNums = new Set((existingOrders || []).map(o => String(o.order_data.orderIndex)));
    
    const { data: allProducts } = await supabase.from('products').select('*');
    const productMap = new Map();
    (allProducts || []).forEach(p => productMap.set(p.description.toLowerCase().trim(), p));

    const { data: allPeople } = await supabase.from('people').select('*');
    const peopleMap = new Map();
    (allPeople || []).forEach(p => peopleMap.set(p.full_name.toLowerCase().trim(), p));

    let consumidorFinal = peopleMap.get('consumidor final');
    if (!consumidorFinal) {
        const { data: created } = await supabase.from('people').insert([{
            full_name: 'Consumidor Final', person_type: 'customers', active: true, updated_at: new Date().toISOString()
        }]).select().single();
        consumidorFinal = created;
    }

    // 4. Group
    const ordersMap = new Map();
    for (let i = 1; i < salesLines.length; i++) {
        const line = salesLines[i].trim();
        if (!line) continue;
        const cols = parseCSVLine(line);
        const orderNum = cols[idx.orderNum];
        if (!orderNum || existingNums.has(orderNum)) continue;
        if (!ordersMap.has(orderNum)) ordersMap.set(orderNum, { row: cols, items: [] });
        ordersMap.get(orderNum).items.push(cols);
    }
    console.log(`Orders to process: ${ordersMap.size}`);

    // 5. Insert
    let successCount = 0;
    for (const [orderNum, data] of ordersMap.entries()) {
        try {
            const mainRow = data.row;
            const itemsRows = data.items;
            let customer = peopleMap.get(mainRow[idx.contactName]?.toLowerCase().trim()) || consumidorFinal;
            
            if (customer === consumidorFinal && mainRow[idx.contactName] && mainRow[idx.contactName].toLowerCase() !== 'consumidor final') {
                const { data: newCust } = await supabase.from('people').insert([{
                    full_name: mainRow[idx.contactName], person_type: 'customers',
                    cpf_cnpj: mainRow[idx.cpf], email: mainRow[idx.email], phone: mainRow[idx.phone],
                    address: `${mainRow[idx.address] || ''}, ${mainRow[idx.bairro] || ''}, ${mainRow[idx.municipio] || ''}/${mainRow[idx.estado] || ''} CEP: ${mainRow[idx.cep] || ''}`,
                    active: true, updated_at: new Date().toISOString()
                }]).select().single();
                if (newCust) {
                    customer = newCust;
                    peopleMap.set(newCust.full_name.toLowerCase().trim(), newCust);
                }
            }

            const status = mainRow[idx.situation] === 'Cancelado' ? 'Cancelled' : 'Fulfilled';
            const dateStr = formatDate(mainRow[idx.date]);
            const paymentMethod = orderToPayment.get(String(orderNum)) || 'Não informado';

            const items = [];
            const inventoryMoves = [];
            const priceHistories = [];
            let totalItemsValue = 0, totalItemsCost = 0;

            for (const itemRow of itemsRows) {
                const desc = itemRow[idx.desc].trim();
                const matchedProduct = productMap.get(desc.toLowerCase());
                const quantity = parsePrice(itemRow[idx.qty]);
                const unitPrice = parsePrice(itemRow[idx.price]);
                const costPrice = parsePrice(itemRow[idx.cost]);
                totalItemsValue += quantity * unitPrice;
                totalItemsCost += quantity * costPrice;

                items.push({
                    productId: matchedProduct?.id, description: desc, quantity, unitPrice, costPrice,
                    unitDiscount: parsePrice(mainRow[idx.discOrder]), discountType: 'fixed', handlingType: 'stock',
                    condition: desc.toLowerCase().includes('salvado') ? 'salvado' : (desc.toLowerCase().includes('usado') ? 'usado' : 'novo')
                });

                if (matchedProduct?.id) {
                    if (status === 'Fulfilled') {
                        inventoryMoves.push({
                            product_id: matchedProduct.id, product_description: desc, type: 'withdrawal',
                            quantity, date: dateStr, label: `Pedido #${orderNum} (Importado)`,
                            unit_cost: costPrice, created_at: new Date().toISOString()
                        });
                    }
                    priceHistories.push({
                        product_id: matchedProduct.id, old_unit_price: matchedProduct.unit_price || 0, new_unit_price: unitPrice,
                        old_cost_price: matchedProduct.cost_price || 0, new_cost_price: costPrice, change_type: 'both', created_at: dateStr
                    });
                }
            }

            const orderData = {
                orderType: 'sale', status, orderIndex: parseInt(orderNum), date: dateStr,
                seller: mainRow[idx.seller] || 'Bling Import', observation: mainRow[idx.obs],
                customerData: {
                    fullName: customer.full_name, phone: customer.phone || '', email: customer.email || '', cpfCnpj: customer.cpf_cnpj || '',
                    fullAddress: typeof customer.address === 'object' ? customer.address : { street: customer.address || '' }
                },
                items,
                itemsSummary: {
                    totalQuantity: items.reduce((acc, i) => acc + i.quantity, 0),
                    itemsSubtotal: totalItemsValue,
                    totalFixedDiscount: parsePrice(mainRow[idx.discOrder]),
                    itemsTotalValue: parsePrice(mainRow[idx.total]),
                    totalItemsCost: totalItemsCost
                },
                shipping: {
                    value: parsePrice(mainRow[idx.freight]), method: 'Importado',
                    address: typeof customer.address === 'object' ? customer.address : { street: customer.address || '' }
                },
                payments: [{ method: paymentMethod, value: parsePrice(mainRow[idx.total]), status: status === 'Fulfilled' ? 'paid' : 'pending', date: dateStr }],
                paymentsSummary: { totalPaid: status === 'Fulfilled' ? parsePrice(mainRow[idx.total]) : 0, totalPending: status === 'Fulfilled' ? 0 : parsePrice(mainRow[idx.total]), totalValue: parsePrice(mainRow[idx.total]) },
                stockProcessed: status === 'Fulfilled', marketingOrigin: mainRow[idx.origin] || 'Bling'
            };

            await supabase.from('orders').insert([{ order_data: orderData, updated_at: new Date().toISOString() }]);
            if (inventoryMoves.length > 0) await supabase.from('inventory_moves').insert(inventoryMoves);
            if (priceHistories.length > 0) await supabase.from('product_price_history').insert(priceHistories);

            successCount++;
            if (successCount % 50 === 0) console.log(`Processed ${successCount} orders...`);
        } catch (err) {
            console.error(`Error order #${orderNum}:`, err.message);
        }
    }
    console.log(`--- FINISHED: ${successCount} orders imported ---`);
}

run();
