
const fs = require('fs');
const url = 'https://wzpdfmihnwcrgkyagwkd.supabase.co/rest/v1/orders?select=*&order=id.desc&limit=10';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

async function fetchLastOrders() {
  try {
    const resp = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await resp.json();
    fs.writeFileSync('marcus_dump.json', JSON.stringify(data, null, 2));
    console.log('Success - marcus_dump.json created');
  } catch (e) {
    fs.writeFileSync('marcus_error.txt', e.toString());
    console.error(e);
  }
}
fetchLastOrders();
