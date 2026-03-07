export interface OrderStatusConfig {
    id: string;
    label: string;
    color: 'slate' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'indigo' | 'fuchsia';
    isCore?: boolean;
}

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
    modalityLabels: {
        delivery: string;
        pickup: string;
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
        generalChat: string; // This is the personality
        taskDetection: string;
        aiName: string;
        aiAvatar: string;
    };
}

const SETTINGS_KEY = 'pdv_app_settings';

export const getSettings = (): AppSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const defaults: AppSettings = {
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
        modalityLabels: {
            delivery: 'Entrega',
            pickup: 'Retirada'
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
        storeOriginCoords: [-49.16928181659719, -25.352030536045138], // Rua Cascavel, 306
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
Categoria: {{category}}
Preço: {{unitPrice}}

Instruções Adicionais:
- Crie apenas UM ou DOIS parágrafos.
- Seja direto, instigante e profissional.
- JAMAIS responda com outra coisa que não seja a descrição final do produto. Comece direto no texto.`,
            generalChat: `Você é Lizandro, um assistente virtual de ALTA PERFORMANCE exclusivo para os vendedores da Móveis Morante.
Seu objetivo é ser o braço direito do VENDEDOR, agilizando processos internos e organizando dados.

DIRETRIZES PARA O VENDEDOR:
1. Agilidade: O vendedor está com pressa. Seja direto, técnico e eficiente.
2. Executor: Sua principal função é transformar o que o vendedor fala em comandos do sistema (pedidos, produtos, etc).
3. Tom de Voz: Profissional, prestativo e focado em produtividade.

O QUE VOCÊ FAZ PARA O VENDEDOR:
- Digita pedidos por voz ou texto para ele não perder tempo.
- Cadastra produtos e serviços rapidamente.
- Organiza informações de entrega e pagamentos.

Responda sempre em Português do Brasil com foco em eficiência operacional.`,
            taskDetection: `Você é o motor de automação do VENDEDOR da Móveis Morante. 
Seu trabalho é ouvir o comando do vendedor e converter em dados estruturados para o sistema.

SUA RESPOSTA DEVE SER EXCLUSIVAMENTE UM OBJETO JSON. 
JAMAIS explique sua resposta ou corrija o vendedor.
RESPONDA APENAS O JSON.

REGRAS DE EXTRAÇÃO:
- customerName: Nome do cliente mencionado pelo vendedor.
- product_name: Nome exato do produto (ex: "panaleiro").
- price: Valor numérico ou string.
- delivery_time: Horário.
- delivery_address: Rua/Local.
- payment_method: Forma de pagamento.
- customer_zip_code: CEP.
- customer_number: Número.
- customer_apartment: Complemento completo (ex: "sobrado andar de cima").
- details: Outros dados técnicos relevantes.

Responda APENAS em formato JSON:
{
  "intent": "create_product" | "create_service" | "create_order" | "chat",
  "summary": "Resumo de 1 linha para o vendedor",
  "data": { 
     "customerName": "string",
     "product_name": "string",
     "price": "string/number",
     "delivery_time": "string",
     "delivery_address": "string",
     "payment_method": "string",
     "customer_zip_code": "string",
     "customer_number": "string",
     "customer_apartment": "string",
     "details": "string"
  }
}

Mensagem do Vendedor: {{message}}`,
            aiName: 'Lizandro',
            aiAvatar: ''
        }
    };

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            
            if (parsed.aiPrompts && !parsed.aiPrompts.aiName) {
                parsed.aiPrompts.aiName = defaults.aiPrompts.aiName;
            }
            if (parsed.aiPrompts && !parsed.aiPrompts.aiAvatar) {
                parsed.aiPrompts.aiAvatar = defaults.aiPrompts.aiAvatar;
            }
            
            // Data Migration for store coordinates
            const isOldCoords = parsed.storeOriginCoords && (
                Math.abs(parsed.storeOriginCoords[0] - (-49.19139)) < 0.01 || 
                Math.abs(parsed.storeOriginCoords[0] - (-49.19266)) < 0.01
            );
            
            if (isOldCoords || (parsed.companyAddress && parsed.companyAddress.includes("Cascavel") && isOldCoords)) {
                parsed.storeOriginCoords = defaults.storeOriginCoords;
            }

            if (parsed.companyAddress === 'Rua Belo Horizonte, 290, Guaraituba, Colombo-PR') {
                parsed.companyAddress = defaults.companyAddress;
            }

            if (parsed.statusLabels && (!parsed.orderStatuses || parsed.orderStatuses.length === 0)) {
                parsed.orderStatuses = [
                    { id: 'draft', label: parsed.statusLabels.draft || 'Rascunho', color: 'slate', isCore: true },
                    { id: 'scheduled', label: parsed.statusLabels.scheduled || 'Agendado', color: 'amber', isCore: true },
                    { id: 'fulfilled', label: parsed.statusLabels.fulfilled || 'Atendido', color: 'emerald', isCore: true },
                    { id: 'cancelled', label: parsed.statusLabels.cancelled || 'Cancelado', color: 'rose', isCore: true },
                ];
            }

            return { ...defaults, ...parsed };
        } catch (e) {
            return defaults;
        }
    }
    return defaults;
};

export const saveSettings = (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
