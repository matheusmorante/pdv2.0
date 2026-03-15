
import fetch from 'node-fetch';

async function testGenerateTitle() {
    const url = 'http://localhost:3003/api/generate-marketplace-title';
    const body = {
        description: 'Guarda-Roupa Casal 6 Portas',
        material: 'Madeira MDP',
        differential: 'Pés inclusos e corrediças metálicas'
    };

    console.log('Testing generate-marketplace-title endpoint...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Error:', err);
            return;
        }

        const data = await response.json();
        console.log('Generated Title:', data.title);
        
        if (data.title && data.title.length <= 60) {
            console.log('Success: Title is within character limit.');
        } else if (data.title) {
            console.log('Warning: Title exceeds 60 characters:', data.title.length);
        } else {
            console.log('Failure: No title generated.');
        }
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
}

testGenerateTitle();
