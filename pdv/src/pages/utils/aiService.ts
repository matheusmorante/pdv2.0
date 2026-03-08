import { toast } from "react-toastify";

export interface AIIntentResponse {
    intent: 'create_product' | 'create_service' | 'create_order' | 'chat';
    summary?: string;
    data: any;
}

export interface AIChatResponse {
    answer: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using v1beta and gemini-1.5-flash-latest which is highly compatible with REST
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente virtual de vendas especializado em materiais de construção civil. 
Aja de forma profissional, educada e direta. Ajude os clientes a encontrar os produtos certos.
Responda sempre em Português do Brasil. Seja conciso nas respostas.`;

async function callGemini(systemPrompt: string, userMessage: string, temperature = 0.7) {
    if (!API_KEY) {
        throw new Error("Chave VITE_GEMINI_API_KEY não configurada.");
    }

    const payload = {
        contents: [
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            {
                role: "model",
                parts: [{ text: "Entendido. Como posso ajudar?" }]
            },
            {
                role: "user",
                parts: [{ text: userMessage }]
            }
        ],
        generationConfig: {
            temperature: temperature
        }
    };

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Erro da API Gemini:", errData);
            throw new Error(errData.error?.message || "Falha na comunicação com o Gemini API");
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error: any) {
        console.error("Falha ao comunicar com o Gemini API:", error);
        toast.error(`Erro na IA: ${error.message || 'Erro desconhecido'}`);
        throw error;
    }
}

export const aiService = {
    async detectIntent(message: string, detectionPrompt: string): Promise<AIIntentResponse> {
        try {
            const rawText = await callGemini(`System Instruction: ${detectionPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown blocks, no extra text.`, message, 0.1);
            
            let resultData = rawText.trim();
            // Basic cleanup for common AI formatting quirks
            if (resultData.includes('```json')) {
                resultData = resultData.split('```json')[1].split('```')[0].trim();
            } else if (resultData.includes('```')) {
                resultData = resultData.split('```')[1].split('```')[0].trim();
            }

            return JSON.parse(resultData);
        } catch (error) {
            console.error("Erro ao processar intent com Gemini:", error);
            throw error;
        }
    },

    async chat(message: string, systemPrompt: string): Promise<AIChatResponse> {
        const text = await callGemini(systemPrompt || DEFAULT_SYSTEM_PROMPT, message, 0.7);
        return { answer: text || "Desculpe, não consegui processar sua solicitação no momento." };
    },

    async generateDescription(productData: { productName: string; category: string; unitPrice: number; promptTemplate: string }) {
        if (!productData.productName) throw new Error("Nome do produto é obrigatório");

        const systemPrompt = productData.promptTemplate || `Crie uma descrição comercial atraente e profissional para o seguinte produto de material de construção: "${productData.productName}". A descrição deve ser curta (máximo 3 parágrafos), destacando os principais benefícios e usos. Em português do Brasil.`;

        const rawText = await callGemini(systemPrompt, `Gere a descrição para o produto "${productData.productName}" agora.`, 0.7);
        return { description: rawText || "" };
    }
};
