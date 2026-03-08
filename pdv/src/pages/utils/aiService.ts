import { toast } from "react-toastify";

export interface AIIntentResponse {
    intent: 'create_product' | 'create_service' | 'create_order' | 'chat';
    status?: 'ready' | 'incomplete';
    summary?: string;
    data: any;
}

export interface AIChatResponse {
    answer: string;
}

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Configs for Llama 3 (Groq Cloud)
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const LLAMA_MODEL = "llama-3.3-70b-versatile";

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente virtual de vendas especializado em materiais de construção civil. 
Aja de forma profissional, educada e direta. Ajude os clientes a encontrar os produtos certos.
Responda sempre em Português do Brasil. Seja conciso nas respostas.`;

async function callAI(systemPrompt: string, userMessage: string, temperature = 0.7) {
    if (!GROQ_KEY || GROQ_KEY === "SUA_CHAVE_GROQ_AQUI") {
        throw new Error("Sem chaves de AI (Groq) configuradas.");
    }
    return callGroq(systemPrompt, userMessage, temperature);
}

async function callGroq(systemPrompt: string, userMessage: string, temperature = 0.7) {
    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
                model: LLAMA_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: temperature,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Groq API Error");
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (error: any) {
        console.error("Groq API Error:", error);
        throw error;
    }
}

export const aiService = {
    async detectIntent(message: string, detectionPrompt: string, context?: any): Promise<AIIntentResponse> {
        try {
            const finalPrompt = detectionPrompt.replace('{{context}}', JSON.stringify(context || {}));

            const rawText = await callAI(`System: ${finalPrompt}\nIMPORTANT: Respond ONLY with a valid JSON.`, message, 0.1);
            let resultData = rawText.trim();
            if (resultData.includes('```json')) resultData = resultData.split('```json')[1].split('```')[0].trim();
            else if (resultData.includes('```')) resultData = resultData.split('```')[1].split('```')[0].trim();
            return JSON.parse(resultData);
        } catch (error) {
            console.error("AI Detect Intent Error:", error);
            throw error;
        }
    },

    async chat(message: string, chatPrompt: string, context?: any): Promise<AIChatResponse> {
        try {
            let systemContext = chatPrompt || DEFAULT_SYSTEM_PROMPT;
            if (context && Object.keys(context).length > 0) {
                systemContext += `\nCONTEÚDO ATUAL DO PEDIDO EM ANDAMENTO: ${JSON.stringify(context)}`;
            }
            const rawText = await callAI(systemContext, message, 0.7);
            return { answer: rawText || "Desculpe, falha no processamento da IA no momento." };
        } catch (error) {
            console.error("AI Chat Error:", error);
            return { answer: "Desculpe, falha no processamento da IA no momento." };
        }
    },

    async generateDescription(productData: { productName: string; category: string; unitPrice: number; promptTemplate: string }) {
        if (!productData.productName) throw new Error("Nome do produto é obrigatório");
        const systemPrompt = productData.promptTemplate || `Crie uma descrição comercial curta e profissional para: "${productData.productName}".`;
        const rawText = await callAI(systemPrompt, `Gere a descrição para "${productData.productName}" agora.`, 0.7);
        return { description: rawText || "" };
    }
};

