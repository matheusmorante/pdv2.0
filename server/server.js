import express from 'express';
import cors from 'cors';
import { getLlama, LlamaChatSession, resolveModelFile } from 'node-llama-cpp';

const app = express();
app.use(cors());
app.use(express.json());

let llama;
let model;
let context;
let chatSession;

app.get('/', (req, res) => res.send("AI Server is running (v4 - Stable)"));

async function bootstrapLlama() {
    console.log("==========================================");
    console.log("Inicializando Lizandro IA (Versão Estável) ...");
    try {
        llama = await getLlama();
        const modelUri = "hf:mradermacher/Phi-3-mini-4k-instruct-GGUF/Phi-3-mini-4k-instruct.Q4_K_M.gguf";
        const modelPath = await resolveModelFile(modelUri);
        
        model = await llama.loadModel({ modelPath });
        
        // Criamos o contexto com 1 sequência dedicada
        context = await model.createContext({ sequences: 1 });
        
        // Criamos uma única sessão que será reutilizada
        chatSession = new LlamaChatSession({ 
            contextSequence: context.getSequence()
        });
        
        console.log("LIZANDRO ESTÁ ONLINE E PRONTO!");
        console.log("==========================================");
    } catch (error) {
        console.error("Erro fatal ao iniciar a IA:", error);
    }
}

bootstrapLlama();

// Rota genérica para qualquer prompt
async function safePrompt(prompt, systemPrompt = null) {
    if (!chatSession) throw new Error("IA ainda carregando...");
    
    // Resetamos o histórico antes de cada operação para evitar interferência
    // e economia de tokens no contexto
    chatSession.setChatHistory([]);
    
    // Se houver um systemPrompt específico (como o de detecção), aplicamos
    // Note: Em algumas versões, o systemPrompt é definido na criação da sessão.
    // Para manter estável, vamos apenas concatenar ou usar o padrão.
    
    const response = await chatSession.prompt(prompt);
    return response;
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
        const { message } = req.body;
        const answer = await safePrompt(message);
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

        const answer = await safePrompt(prompt);
        console.log("Resposta Lizandro:", answer);
        
        const jsonMatch = answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return res.json(JSON.parse(jsonMatch[0]));
            } catch (e) {}
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

app.listen(3001, () => console.log(`Servidor rodando na porta 3001`));
