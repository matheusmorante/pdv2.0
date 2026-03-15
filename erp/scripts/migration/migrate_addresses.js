import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';
const supabase = createClient(supabaseUrl, supabaseKey);

function parseAddressString(addrStr) {
    if (!addrStr || typeof addrStr !== 'string') return null;

    // Pattern: Rua Professor Naoki Kishida, 62 - Sítio Cercado - / - CEP: 
    // OR: Rua Campo Mourao, 599 - Guaraituba - Colombo/PR - CEP:
    
    const parts = addrStr.split(' - ').map(p => p.trim());
    const result = {
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: ''
    };

    if (parts.length >= 1) {
        const streetNumber = parts[0].split(', ');
        result.street = streetNumber[0] || '';
        result.number = streetNumber[1] || '';
    }

    if (parts.length >= 2) {
        result.neighborhood = parts[1];
    }

    if (parts.length >= 3) {
        const cityState = parts[2].split('/');
        result.city = cityState[0] || '';
        result.state = cityState[1] || '';
    }

    // Try to find CEP in any part
    for (const part of parts) {
        if (part.toUpperCase().includes('CEP:')) {
            result.cep = part.replace(/CEP:/i, '').trim();
        }
    }

    // Sometimes neighborhood is in city part if it's "Neighborhood - City"
    if (result.neighborhood === '/' || result.neighborhood === '') {
        // try to reconstruct?
    }

    return result;
}

async function migrateAddresses() {
    console.log("Starting address migration...");
    const { data: people, error } = await supabase
        .from('people')
        .select('id, address');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Processing ${people.length} records...`);

    for (const person of people) {
        let currentAddr = person.address;
        let parsed = null;

        if (typeof currentAddr === 'string' && currentAddr.length > 5) {
            parsed = parseAddressString(currentAddr);
        } else if (currentAddr && typeof currentAddr === 'object') {
            // Check if street contains separators
            if (currentAddr.street && currentAddr.street.includes(' - ')) {
                parsed = parseAddressString(currentAddr.street);
                // merge with existing object properties if they are empty
                if (parsed) {
                    parsed.complement = currentAddr.complement || '';
                    if (!parsed.number) parsed.number = currentAddr.number || '';
                    if (!parsed.neighborhood) parsed.neighborhood = currentAddr.neighborhood || '';
                    if (!parsed.city) parsed.city = currentAddr.city || '';
                    if (!parsed.cep) parsed.cep = currentAddr.cep || '';
                }
            }
        }

        if (parsed) {
            console.log(`Updating ID ${person.id}: ${parsed.street}, ${parsed.number} - ${parsed.neighborhood}`);
            const { error: updateError } = await supabase
                .from('people')
                .update({
                    address: parsed
                })
                .eq('id', person.id);
            
            if (updateError) {
                console.error(`Error updating ID ${person.id}:`, updateError);
            }
        }
    }

    console.log("Migration finished.");
}

migrateAddresses();
