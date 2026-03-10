import { supabase } from "./supabaseConfig";

export interface OrderStatusConfig {
    id: string;
    label: string;
    color: 'slate' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'indigo' | 'fuchsia';
    isCore?: boolean;
}

export type OrderTypeColor = 'orange' | 'purple' | 'green' | 'blue' | 'amber' | 'rose' | 'indigo' | 'emerald' | 'cyan' | 'pink';

export interface AppSettings {
    // Automação e Status
    showManualFulfillmentPrompt: boolean;
    autoSaveOnlyWhenDirty: boolean;
    
    // Rótulos Customizados
    statusLabels?: {
        draft: string;
        scheduled: string;
        fulfilled: string;
        cancelled: string;
    };
    orderStatuses: OrderStatusConfig[];
    orderTypeLabels: {
        delivery: string;
        pickup: string;
        assistance: string;
    };
    orderTypeColors: {
        delivery: OrderTypeColor;
        pickup: OrderTypeColor;
        assistance: OrderTypeColor;
    };
    deliveryHandlingOptions: string[]; 
    pickupHandlingOptions: string[];
    
    // Logística e Valores
    freightPerKm: number;
    openRouteServiceApiKey: string;
    storeOriginCoords: [number, number]; // [lng, lat]
    companyName: string;
    companyAddress: string;
    companyCnpj: string;
    companyPhone: string;
    
    // Formatação de Dados
    autoCapitalizeCustomerData: boolean;
    
    // Comunicação e Links
    googleReviewUrl: string;
    
    // Aparência e Comportamento
    defaultTheme: 'light' | 'dark';
    
    // Scroll Automático
    autoScroll: {
        orderTable: boolean;
        scheduleCards: boolean;
        scheduleTable: boolean;
        speed: number;
        threshold: number;
    };
    aiPrompts: {
        productDescription: string;
        generalChat: string; 
        taskDetection: string;
        aiName: string;
        aiAvatar: string;
    };
    orderAutomation: {
        autoPrintReceipt: boolean;
        autoPrintDeliveryOrder: boolean;
        autoSendWhatsAppDelivery: boolean;
        autoSendCustomerOrder: boolean;
        deliveryPhone: string;
    };
    stockNotificationConditions?: ('novo' | 'usado' | 'salvado')[];
    rolePermissions?: {
        manualStockMovement: string[]; // Roles that can do manual withdrawal/reversal
        productConfig: string[]; // Roles that can edit product notification settings
        viewFinancials: string[]; // Roles that can see financial summaries
        deleteOrders: string[]; // Roles that can send orders to trash
        manageSettings: string[]; // Roles that can access settings page
    };
}

const SETTINGS_KEY = 'pdv_app_settings';
const SUPABASE_SETTINGS_TABLE = 'settings';
const SETTINGS_ID = 'app';

export const getDefaultSettings = (): AppSettings => ({
    showManualFulfillmentPrompt: true,
    autoSaveOnlyWhenDirty: true,
    statusLabels: {
        draft: 'Rascunho',
        scheduled: 'Agendado',
        fulfilled: 'Atendido',
        cancelled: 'Cancelado'
    },
    orderStatuses: [
        { id: 'draft', label: 'Rascunho', color: 'slate', isCore: true },
        { id: 'scheduled', label: 'Agendado', color: 'amber', isCore: true },
        { id: 'fulfilled', label: 'Atendido', color: 'emerald', isCore: true },
        { id: 'cancelled', label: 'Cancelado', color: 'rose', isCore: true },
    ],
    orderTypeLabels: {
        delivery: 'Entrega/Serviço',
        pickup: 'Retirada',
        assistance: 'Assistência'
    },
    orderTypeColors: {
        delivery: 'green',
        pickup: 'purple',
        assistance: 'orange'
    },
    deliveryHandlingOptions: [
        'Entrega com montagem no local',
        'Apenas Entrega',
        'Manuseio Especial'
    ],
    pickupHandlingOptions: [
        'Retirada na loja',
        'Retirada no depósito'
    ],
    freightPerKm: 0,
    openRouteServiceApiKey: '',
    storeOriginCoords: [-49.16928181659719, -25.352030536045138],
    companyName: 'Móveis Morante',
    companyAddress: 'R. Cascavel, 306 - Guaraituba, Colombo - PR, 83410-270',
    companyCnpj: '44.512.248.0001/07',
    companyPhone: '(41) 99749-3547',
    autoCapitalizeCustomerData: true,
    googleReviewUrl: 'https://g.page/r/CctxeFYzY2o8EBE/review',
    defaultTheme: 'light',
    autoScroll: {
        orderTable: true,
        scheduleCards: true,
        scheduleTable: true,
        speed: 20,
        threshold: 100
    },
    aiPrompts: {
        productDescription: `Você é um copywriter de marketing especialista em e-commerce da Móveis Morante.
Sua tarefa é criar uma descrição de produto incrivelmente persuasiva, focada em vendas.

Produto: {{productName}}
Preço: {{unitPrice}}

Instruções Adicionais:
- Crie apenas UM ou DOIS parágrafos.
- Seja direto, instigante e profissional.
- JAMAIS responda com outra coisa que não seja a descrição final do produto. Comece direto no texto.`,
        generalChat: `Você é Lisandro, um assistente virtual de ALTA PERFORMANCE exclusivo para os vendedores da Móveis Morante.
Seu objetivo é ser o braço direito do VENDEDOR, agilizando processos internos e organizando dados.

DIRETRIZES PARA O VENDEDOR:
1. BREVIDADE MÁXIMA: O vendedor está com pressa. Use frases curtas. Não use introduções longas ou despedidas.
2. Agilidade: Responda apenas o estritamente necessário.
3. Executor: Sua principal função é transformar o que o vendedor fala em comandos do sistema (pedidos, produtos, etc).
4. Tom de Voz: Profissional, ultra-eficiente e focado em produtividade.

O QUE VOCÊ FAZ PARA O VENDEDOR:
- Digita pedidos por voz ou texto instantaneamente.
- Cadastra produtos e serviços rapidamente.
- Organiza informações de entrega e pagamentos.

Responda sempre em Português do Brasil com foco em velocidade total.`,
        taskDetection: `Você é o motor de automação do VENDEDOR da Móveis Morante. 
Seu trabalho é ouvir o comando do vendedor e converter em dados estruturados para o sistema.

REGRAS DE EXTRAÇÃO E FLUXO:
1. ULTRA CONCISÃO: Pergunte as coisas da forma mais curta possível (ex: "Qual o cliente?").
2. FOCO EM DADOS: Só pergunte campos OBRIGATÓRIOS FALTANTES: 'customerName', 'product_name', 'price', 'payment_method', 'delivery_address'.
3. TRIGGER DE CRIAÇÃO: Se o usuário disser "faz o pedido" ou similar e os dados estiverem prontos, 'status' deve ser 'ready' e 'summary' deve ser "Pronto! Confirmar?".
4. VELOCIDADE: Não use frases de cortesia. Vá direto ao ponto.

DADOS JÁ COLETADOS (CONTEXTO): {{context}}

RESPOSTA NO FORMATO JSON:
{
  "intent": "create_product" | "create_service" | "create_order" | "chat",
  "status": "ready" | "incomplete",
  "summary": "Pergunta curta (ex: 'Valor?') ou resumo (ex: 'Confirmar?')",
  "data": { 
     "customerName": "string",
     "product_name": "string",
     "price": "string/number",
     "delivery_time": "string",
     "delivery_address": "string",
     "payment_method": "string"
  }
}
`,
        aiName: 'Lisandro',
        aiAvatar: ''
    },
    orderAutomation: {
        autoPrintReceipt: true,
        autoPrintDeliveryOrder: true,
        autoSendWhatsAppDelivery: true,
        autoSendCustomerOrder: true,
        deliveryPhone: ''
    },
    stockNotificationConditions: ['novo'],
    rolePermissions: {
        manualStockMovement: ['administrator', 'manager'],
        productConfig: ['administrator', 'manager'],
        viewFinancials: ['administrator', 'manager', 'accountant'],
        deleteOrders: ['administrator', 'manager'],
        manageSettings: ['administrator']
    }
});

export const getSettings = (): AppSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const defaults = getDefaultSettings();

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return { ...defaults, ...parsed };
        } catch (e) {
            return defaults;
        }
    }
    return defaults;
};

// Real-time synchronization with Supabase
export const subscribeToSettings = (callback: (settings: AppSettings) => void) => {
    // Initial load from localStorage for speed
    callback(getSettings());

    // Initial load from Supabase
    supabase.from(SUPABASE_SETTINGS_TABLE)
        .select('data')
        .eq('id', SETTINGS_ID)
        .single()
        .then(({ data, error }: { data: any, error: any }) => {
            if (data && !error) {
                const settings = data.data as AppSettings;
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                callback(settings);
            }
        });

    const channel = supabase.channel('settings_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: SUPABASE_SETTINGS_TABLE, filter: `id=eq.${SETTINGS_ID}` }, 
            (payload: any) => {
                if (payload.new) {
                    const settings = (payload.new as any).data as AppSettings;
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                    callback(settings);
                }
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

export const saveSettings = async (settings: AppSettings) => {
    // 1. Save to localStorage (Local First)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // 2. Save to Supabase (Cloud Persistence)
    try {
        const { error } = await supabase
            .from(SUPABASE_SETTINGS_TABLE)
            .upsert({ id: SETTINGS_ID, data: settings });
        
        if (error) throw error;
    } catch (error) {
        console.error("Erro ao persistir configurações no Supabase:", error);
    }
};
