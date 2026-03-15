import fetch from 'node-fetch';

async function testAIDescription() {
    console.log("Testing AI Description Generator...");
    
    const productData = {
        title: "Guarda-Roupa Casal Premium 6 Portas",
        material: "100% MDF",
        dimensions: "240x230x55 cm",
        brand: "Móveis Morante",
        line: "Linha Luxo 2024",
        mainDifferential: "Dobradiças com amortecimento e gavetas com corrediças telescópicas",
        colors: "Branco / Nature",
        notIncluded: "Serviço de montagem",
        type: "whatsapp"
    };

    try {
        const response = await fetch("http://localhost:3003/api/generate-product-description", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        console.log("\n--- WHATSAPP DESCRIPTION ---");
        console.log(data.description);

        const ecommerceResponse = await fetch("http://localhost:3003/api/generate-product-description", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...productData, type: 'ecommerce' })
        });

        const ecommerceData = await ecommerceResponse.json();
        console.log("\n--- ECOMMERCE DESCRIPTION ---");
        console.log(ecommerceData.description);

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testAIDescription();
