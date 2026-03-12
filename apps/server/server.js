import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const logs = [];
function addLog(type, message, data = null) {
    const log = {
        timestamp: new Date().toISOString(),
        type,
        message,
        data
    };
    logs.unshift(log);
    if (logs.length > 50) logs.pop();
    console.log(`[${type}] ${message}`);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDSieSZV89ERk-V5L5M1RWMDsrqN-emt7Q");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/', (req, res) => res.send("AI Server is running (v5 - Gemini Stable)"));

app.get('/api/logs', (req, res) => {
    res.json(logs);
});

async function safePrompt(prompt, systemPrompt = null) {
    try {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error.message);
        
        // MOCK FALLBACK for BI processing
        if (prompt.includes("JSON")) {
            return JSON.stringify({
                product: "Desconhecido",
                reason: "Erro de Conexão",
                objections: ["O sistema não conseguiu processar os detalhes no momento"],
                sentiment: "Neutro",
                customer_profile: "Não identificado",
                priority: "Morno",
                value_estimate: 0,
                suggestions: ["Tente enviar o relato novamente mais tarde"],
                next_step: "Salvar relato bruto"
            });
        }
        return JSON.stringify({ error: "Serviço de IA temporariamente indisponível." });
    }
}

app.post('/api/generate-description', async (req, res) => {
    try {
        const { productName, category, unitPrice, promptTemplate } = req.body;
        addLog("DESCRIPTION", `Gerando descrição para: ${productName}`);

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
        addLog("CHAT", `Nova mensagem recebida`);
        const answer = await safePrompt(message, systemPrompt);
        res.json({ answer });
    } catch (error) {
        addLog("ERROR", `Erro no Chat: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-detect-intent', async (req, res) => {
    try {
        const { message, detectionPrompt } = req.body;
        addLog("INTENT", `Detectando intenção`);
        let prompt = detectionPrompt || `Analise: {{message}}`;
        prompt = prompt.replace(/{{message}}/g, message);

        const answer = await safePrompt(prompt, "Responda APENAS com um objeto JSON válido.");
        
        const jsonMatch = answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                addLog("INTENT_SUCCESS", `Intenção detectada: ${parsed.intent || 'unknown'}`);
                return res.json(parsed);
            } catch (e) { }
        }

        res.json({
            intent: 'chat',
            data: { message: answer }
        });
    } catch (error) {
        addLog("ERROR", `Erro na Intenção: ${error.message}`);
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
