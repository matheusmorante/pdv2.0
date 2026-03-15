const { createClient } = require('@supabase/supabase-js');
console.log("Script iniciado...");
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

const outputPath = path.join('C:', 'Users', 'mathe', 'OneDrive', 'Área de Trabalho', 'projetos', 'moveismorantehub', 'apps', 'erp', 'unlinked_report.json');

async function findUnlinked() {
    console.log("Starting search...");
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Supabase Error:", error);
            fs.writeFileSync(outputPath, JSON.stringify({ error }, null, 2));
            return;
        }

        const unlinked = [];

        orders.forEach(order => {
            const items = order.order_data?.items || [];
            const unlinkedItems = items.filter(item => !item.productId);
            
            if (unlinkedItems.length > 0) {
                unlinked.push({
                    orderId: order.id,
                    customer: order.order_data?.customerData?.fullName || 'Desconhecido',
                    date: order.order_data?.date,
                    items: unlinkedItems.map(i => ({ description: i.description, quantity: i.quantity, price: i.unitPrice }))
                });
            }
        });

        fs.writeFileSync(outputPath, JSON.stringify(unlinked, null, 2));
        console.log("Success! File written to " + outputPath);
    } catch (e) {
        console.error("Exception:", e);
        fs.writeFileSync(outputPath, JSON.stringify({ exception: e.message }, null, 2));
    }
}

findUnlinked();
