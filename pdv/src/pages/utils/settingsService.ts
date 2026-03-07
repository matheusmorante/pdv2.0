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
        storeOriginCoords: [-49.16928181659719, -25.352030536045138], // Coordenadas corretas: Rua Cascavel, 306
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
        }
    };

    if (saved) {
        const parsed = JSON.parse(saved);
        
        // Data Migration for store coordinates (fix previous origin shift)
        const isOldCoords = parsed.storeOriginCoords && (
            Math.abs(parsed.storeOriginCoords[0] - (-49.19139)) < 0.01 || 
            Math.abs(parsed.storeOriginCoords[0] - (-49.19266)) < 0.01
        );
        
        if (isOldCoords || (parsed.companyAddress && parsed.companyAddress.includes("Cascavel") && isOldCoords)) {
            parsed.storeOriginCoords = defaults.storeOriginCoords;
        }

        // Migration for default address if it was the old one
        if (parsed.companyAddress === 'Rua Belo Horizonte, 290, Guaraituba, Colombo-PR') {
            parsed.companyAddress = defaults.companyAddress;
        }

        // Data Migration for orderStatuses
        if (parsed.statusLabels && (!parsed.orderStatuses || parsed.orderStatuses.length === 0)) {
            parsed.orderStatuses = [
                { id: 'draft', label: parsed.statusLabels.draft || 'Rascunho', color: 'slate', isCore: true },
                { id: 'scheduled', label: parsed.statusLabels.scheduled || 'Agendado', color: 'amber', isCore: true },
                { id: 'fulfilled', label: parsed.statusLabels.fulfilled || 'Atendido', color: 'emerald', isCore: true },
                { id: 'cancelled', label: parsed.statusLabels.cancelled || 'Cancelado', color: 'rose', isCore: true },
            ];
        }

        return { ...defaults, ...parsed };
    }
    return defaults;
};

export const saveSettings = (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
