import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDSieSZV89ERk-V5L5M1RWMDsrqN-emt7Q");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get('/', (req, res) => res.send("AI Server is running (v5 - Gemini Stable)"));

async function safePrompt(prompt, systemPrompt = null) {
    try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error.message);
        
        // MOCK FALLBACK for testing if API Key is leaked or offline
        if (error.message.includes("leaked") || error.message.includes("API key")) {
            console.log("Using MOCK AI Answer for testing...");
            if (prompt.includes("JSON")) {
                return JSON.stringify({
                    product: "Produto Exemplo",
                    reason: "Preço",
                    objections: ["Estava um pouco caro", "Prazo longo"],
                    sentiment: "Neutro",
                    customer_profile: "Cliente de Teste",
                    priority: "Morno",
                    value_estimate: 1500,
                    suggestions: ["Oferecer desconto avista"],
                    next_step: "Seguir com follow-up em 2 dias"
                });
            }
            return "Esta é uma resposta de TESTE do Lizandro (Mock). Para respostas reais, atualize a GEMINI_API_KEY no servidor.";
        }
        throw error;
    }
}

app.post('/api/generate-description', async (req, res) => {
    try {
        const { productName, category, unitPrice, promptTemplate } = req.body;
        console.log(`Gerando descrição: ${productName}`);

        let prompt = promptTemplate || `Crie uma descrição persuasiva para o produto ${productName}.`;
        prompt = prompt
            .replace(/{{productName}}/g, productName || '')
            .replace(/{{category}}/g, category || '')
            .replace(/{{unitPrice}}/g, `R$ ${unitPrice || '0.00'}`);

        const answer = await safePrompt(prompt);
        res.json({ description: answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-chat', async (req, res) => {
    try {
        const { message, systemPrompt } = req.body;
        const answer = await safePrompt(message, systemPrompt);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-detect-intent', async (req, res) => {
    try {
        const { message, detectionPrompt } = req.body;
        let prompt = detectionPrompt || `Analise: {{message}}`;
        prompt = prompt.replace(/{{message}}/g, message);

        const answer = await safePrompt(prompt, "Responda APENAS com um objeto JSON válido.");
        console.log("Resposta Lizandro:", answer);

        const jsonMatch = answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return res.json(JSON.parse(jsonMatch[0]));
            } catch (e) { }
        }

        res.json({
            intent: 'chat',
            data: { message: answer }
        });
    } catch (error) {
        console.error("ERRO:", error);
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3003;
app.listen(port, '0.0.0.0', () => {
    console.log("==========================================");
    console.log(`LIZANDRO (GEMINI) ONLINE NA PORTA ${port}`);
    console.log("==========================================");
});

process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, desligando graciosamente...');
    process.exit(0);
});
