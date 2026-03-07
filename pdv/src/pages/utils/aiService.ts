import { toast } from "react-toastify";

export interface AIIntentResponse {
    intent: 'create_product' | 'create_service' | 'create_order' | 'chat';
    summary?: string;
    data: any;
}

export interface AIChatResponse {
    answer: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const aiService = {
    async detectIntent(message: string, detectionPrompt: string): Promise<AIIntentResponse> {
        const response = await fetch(`${API_URL}/ai-detect-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, detectionPrompt }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Erro detalhado do servidor de IA:", errData);
            throw new Error(errData.error || "Falha na detecção de intenção");
        }
        return response.json();
    },

    async chat(message: string, systemPrompt: string): Promise<AIChatResponse> {
        const response = await fetch(`${API_URL}/ai-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, systemPrompt }),
        });
        if (!response.ok) throw new Error("Falha no chat");
        return response.json();
    },

    async generateDescription(productData: { productName: string; category: string; unitPrice: number; promptTemplate: string }) {
        const response = await fetch(`${API_URL}/generate-description`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error("Falha na geração de descrição");
        return response.json();
    }
};
