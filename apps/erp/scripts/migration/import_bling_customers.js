import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const url = "https://wzpdfmihnwcrgkyagwkd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY";
const supabase = createClient(url, key);

const csvFile = "c:\\Users\\Rosilene\\Desktop\\pdv\\contatos_2026-03-11-14-18-33.csv";

const raw = fs.readFileSync(csvFile, 'utf8');
const lines = raw.split('\n');

const splitCSVRow = (row) => {
    let result = [];
    let insideQuote = false;
    let current = '';
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            insideQuote = !insideQuote;
        } else if (char === ';' && !insideQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

const headers = splitCSVRow(lines[0].trim()).map(h => h.replace(/^"/, '').replace(/"$/, '').trim());

const getDigits = (str) => {
    if (!str) return '';
    return str.replace(/\D/g, '');
};

const mapContact = (cells) => {
    const contact = {};
    headers.forEach((h, i) => {
        let val = cells[i] || '';
        val = val.replace(/^"/, '').replace(/"$/, '').trim();
        contact[h] = val;
    });
    return contact;
};

const main = async () => {
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;
        const cells = splitCSVRow(row);
        contacts.push(mapContact(cells));
    }

    console.log(`Parsed ${contacts.length} rows from CSV.`);

    console.log("Fetching existing people from Supabase...");
    let allExisting = [];
    let offset = 0;
    while(true) {
        const { data: existing, error } = await supabase.from('people').select('phone, person_type').range(offset, offset + 999);
        if (error) {
            console.error("Error fetching existing:", error);
            process.exit(1);
        }
        if(!existing || existing.length === 0) break;
        allExisting = allExisting.concat(existing);
        offset += 1000;
        if(existing.length < 1000) break;
    }

    const existingPhoneDigits = new Set();
    allExisting.forEach(p => {
        if (p.phone) {
            const d = getDigits(p.phone);
            if(d.length > 5) existingPhoneDigits.add(d); // only add valid-ish phones
        }
    });

    console.log(`Found ${existingPhoneDigits.size} unique existing valid phone numbers.`);

    const toInsert = [];
    for (const c of contacts) {
        const tipo = c["Tipo contato"];
        if (tipo && !tipo.includes("Cliente") && tipo.trim() !== "") {
            // skip if it is not customer
            continue;
        }

        let phoneToUse = c["Celular"] || c["Fone"] || "";
        let digits = getDigits(phoneToUse);

        if (digits && existingPhoneDigits.has(digits)) {
            continue;
        }

        const payload = {
            person_type: 'customers',
            full_name: c["Nome"],
            nickname: c["Fantasia"] || c["Nome"],
            cpf_cnpj: c["CNPJ / CPF"] || "",
            rg_ie: c["IE / RG"] || "",
            email: c["E-mail"] || "",
            phone: phoneToUse,
            address: {
                street: c["Endereço"] || "",
                number: c["Número"] || "",
                complement: c["Complemento"] || "",
                neighborhood: c["Bairro"] || "",
                city: c["Cidade"] || "",
                state: c["UF"] || "",
                cep: c["CEP"] || ""
            },
            observation: c["Observações"] || "",
            active: c["Situação"] !== "Inativo",
            is_draft: false,
            deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        if (digits.length > 5) existingPhoneDigits.add(digits);
        toInsert.push(payload);
    }

    console.log(`Filter applied. Skipping duplicates and non-clients. Preparing to insert ${toInsert.length} new customers.`);

    if (toInsert.length === 0) {
        console.log("No new customers to insert.");
        return;
    }

    const chunkSize = 100;
    for(let i=0; i<toInsert.length; i+=chunkSize) {
        const chunk = toInsert.slice(i, i+chunkSize);
        const { error: insertError } = await supabase.from('people').insert(chunk);
        if(insertError) {
            console.error("Insertion error:", insertError.message);
        } else {
            console.log(`Inserted ${Math.min(i + chunk.length, toInsert.length)} / ${toInsert.length}`);
        }
    }
    console.log("Import finished successfully!");
};

main();
