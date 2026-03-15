
const url = 'https://wzpdfmihnwcrgkyagwkd.supabase.co/rest/v1/orders?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

async function fetchMarcus() {
  try {
    const resp = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await resp.json();
    const filtered = data.filter(d => JSON.stringify(d).toLowerCase().includes('marcus'));
    
    if (filtered.length === 0) {
      console.log('No Marcus found');
      return;
    }

    filtered.forEach(row => {
      const o = row.order_data;
      console.log(`Order ID: ${row.id}`);
      console.log(`Type: ${o?.orderType}`);
      console.log(`Items:`, JSON.stringify(o?.items || [], null, 2));
      console.log(`Assistance Items:`, JSON.stringify(o?.assistanceItems || [], null, 2));
    });
  } catch (e) {
    console.error(e);
  }
}
fetchMarcus();
