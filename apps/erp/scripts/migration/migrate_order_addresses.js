import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(supabaseUrl, supabaseKey);

function parseAddressString(addrStr) {
    if (!addrStr || typeof addrStr !== 'string') return null;
    const parts = addrStr.split(' - ').map(p => p.trim());
    const result = { cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '' };
    if (parts.length >= 1) {
        const streetNumber = parts[0].split(', ');
        result.street = streetNumber[0] || '';
        result.number = streetNumber[1] || '';
    }
    if (parts.length >= 2) result.neighborhood = parts[1];
    if (parts.length >= 3) {
        const cityState = parts[2].split('/');
        result.city = cityState[0] || '';
        result.state = cityState[1] || '';
    }
    for (const part of parts) {
        if (part.toUpperCase().includes('CEP:')) result.cep = part.replace(/CEP:/i, '').trim();
    }
    return result;
}

async function migrateOrderAddresses() {
    console.log("Starting order address migration...");
    const { data: orders, error } = await supabase.from('orders').select('id, order_data');
    if (error) { console.error(error); return; }
    console.log(`Processing ${orders.length} orders...`);

    for (const order of orders) {
        let changed = false;
        const odata = order.order_data;
        const cdata = odata?.customerData;

        if (cdata && cdata.fullAddress) {
            const fa = cdata.fullAddress;
            if (fa.street && fa.street.includes(' - ')) {
                const parsed = parseAddressString(fa.street);
                if (parsed) {
                    odata.customerData.fullAddress = { ...fa, ...parsed };
                    changed = true;
                }
            } else if (!fa.neighborhood && cdata.address && typeof cdata.address === 'string') {
                // some old ones might have it in customerData.address
                 const parsed = parseAddressString(cdata.address);
                 if (parsed) {
                     odata.customerData.fullAddress = { ...fa, ...parsed };
                     changed = true;
                 }
            }
        }

        if (changed) {
            console.log(`Updating Order ID ${order.id}`);
            await supabase.from('orders').update({ order_data: odata }).eq('id', order.id);
        }
    }
    console.log("Order migration finished.");
}

migrateOrderAddresses();
