const GRAPH_API_VERSION = 'v18.0';
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com';

const whatsappConfig = {
    accessToken: 'EAAXhQRzKDuwBQ6kzw1BSKZBaZAKSR4HQPVkeF5HRsqMptd1MiRX5ZCqVxb9lZBEqB4z0fifShZCYT8jzdaaKmIzCSbMWz3XMDL6DSVQNE6ZB6Gx0WSya5KTAdjH7S9zlkVzrUECy161CzOEsq7ZCrkoRnme5rkZCirlLyjKPC3jknjfZCJQswMcbbnMrrmEjhhgZDZD',
    wabaId: '3798949667074041',
    catalogId: '623712348705836',
};

async function main() {
    console.log("=== VAMOS VERIFICAR O QUE É O CATALOG ID INFORMADO ===");
    
    // 1. Verificar as informações daquele Node (623712348705836)
    const resNode = await fetch(`${FACEBOOK_GRAPH_URL}/${GRAPH_API_VERSION}/${whatsappConfig.catalogId}`, {
        headers: { 'Authorization': `Bearer ${whatsappConfig.accessToken}` }
    });
    const dataNode = await resNode.json();
    console.log("Node Info:", dataNode);

    // 2. Verificar o WABA para tentar puxar o id REAL do Catálogo
    const resWaba = await fetch(`${FACEBOOK_GRAPH_URL}/${GRAPH_API_VERSION}/${whatsappConfig.wabaId}?fields=id,name,product_catalogs`, {
        headers: { 'Authorization': `Bearer ${whatsappConfig.accessToken}` }
    });
    const dataWaba = await resWaba.json();
    console.log("\nWABA Info:", JSON.stringify(dataWaba, null, 2));
}

main();
