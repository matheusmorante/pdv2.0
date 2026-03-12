import { supabase } from "./supabaseConfig";
import Order from "../types/order.type";
import { aiService } from "./aiService";

export interface CustomerDesire {
    id?: string;
    customer_phone: string;
    customer_name?: string;
    product_name: string;
    category?: string;
    details?: string;
    status: 'pending' | 'notified' | 'cancelled';
    created_at?: string;
}

export const crmIntelligenceService = {
    /**
     * Busca o histórico de compras de um cliente pelo telefone
     */
    async getCustomerPurchaseHistory(phone: string): Promise<any[]> {
        const cleanPhone = phone.replace(/\D/g, '');
        
        const { data: orders, error } = await supabase
            .from('orders')
            .select('items, customerData')
            .or(`customerData->>phone.eq.${phone},customerData->>phone.eq.${cleanPhone}`);

        if (error) {
            console.error("Erro ao buscar histórico do cliente:", error);
            return [];
        }

        // Extrai todos os itens de todos os pedidos
        const items = orders.flatMap(order => 
            (order.items || []).map((item: any) => ({
                ...item,
                order_date: (order as any).created_at,
                customer_name: order.customerData?.fullName
            }))
        );

        return items;
    },

    /**
     * Registra um interesse/desejo de produto do cliente
     */
    async registerProductDesire(desire: CustomerDesire) {
        const { data, error } = await supabase
            .from('customer_desires')
            .upsert([desire]);

        if (error) {
            console.error("Erro ao registrar desejo do cliente:", error);
            throw error;
        }
        return data;
    },

    /**
     * Busca desejos pendentes que coincidem com um novo produto (ex: Salvados)
     */
    async findMatchingDesires(productName: string, category?: string) {
        const { data, error } = await supabase
            .from('customer_desires')
            .select('*')
            .eq('status', 'pending');

        if (error) return [];

        // Filtro simples por nome (pode ser melhorado com IA)
        return data.filter(desire => 
            productName.toLowerCase().includes(desire.product_name.toLowerCase()) ||
            desire.product_name.toLowerCase().includes(productName.toLowerCase())
        );
    },

    /**
     * Analisa uma mensagem do cliente, detecta a intenção e tenta fazer o match com produtos comprados
     */
    async analyzeCustomerIntent(phone: string, message: string) {
        // 1. Busca histórico de compras
        const history = await this.getCustomerPurchaseHistory(phone);
        const historyContext = history.map(item => ({
            id: item.id,
            name: item.name,
            date: item.order_date,
            category: item.category
        }));

        // 2. Chama a IA para detectar intenção e match
        const prompt = `Você é o Lisandro, o cérebro do CRM da Móveis Morante.
        Analise a mensagem do cliente e o histórico de compras dele abaixo.
        
        MENSAGEM: "${message}"
        HISTÓRICO DE COMPRAS: ${JSON.stringify(historyContext)}
        
        Sua tarefa:
        1. Identifique a intenção: 'ASSISTANCE' (assistência técnica), 'DESIRE' (quer algo que não tem), 'INQUIRY' (dúvida comum) ou 'SALES' (quer comprar algo).
        2. Se for 'ASSISTANCE', tente identificar qual produto do HISTÓRICO ele está mencionando (ex: se ele disser "meu guarda-roupa", veja qual guarda-roupa ele comprou).
        3. Se for 'DESIRE', extraia o nome do produto e detalhes (cor, medida).
        
        RETORNE APENAS JSON:
        {
            "intent": "ASSISTANCE" | "DESIRE" | "INQUIRY" | "SALES",
            "confidence": 0 a 1,
            "matched_product": { "id": "string", "name": "string" } | null,
            "extracted_data": {
                "product_name": "string",
                "details": "string",
                "problem_description": "string"
            },
            "summary": "Resumo curto do que o cliente quer"
        }`;

        const aiResponse = await aiService.chat(prompt, "Sempre retorne JSON puro.");
        let ans = aiResponse.answer.trim();
        if (ans.startsWith('```json')) ans = ans.replace(/^```json/, '').replace(/```$/, '').trim();
        
        try {
            return JSON.parse(ans);
        } catch (e) {
            console.error("Erro ao parsear resposta da IA de CRM:", e);
            return null;
        }
    }
};
