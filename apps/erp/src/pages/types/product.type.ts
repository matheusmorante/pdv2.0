export type Variation = {
    id: string;
    sku: string;
    name: string; // e.g., "Cor: Azul, Tamanho: P"
    stock: number;
    unitPrice: number;
    costPrice?: number;
    active: boolean;
    attributes: { name: string; value: string }[];
    syncWithParent?: boolean; // Legacy/Global
    syncUnitPrice?: boolean;
    syncCostPrice?: boolean;
    syncDescription?: boolean;
    images?: string[];
    freightType?: 'fixed' | 'percentage';
    freightCost?: number;
    ipiPercent?: number;
    finalPurchasePrice?: number;
    minStock?: number;
    comboItems?: ComboItem[];
};

export type FiscalInfo = {
    ncm?: string;
    ncmDescription?: string; // Auto-generated category or description of the NCM
    material?: string; // Material or composition to aid NCM search
    condition?: 'novo' | 'usado' | 'salvado' | ''; // Store condition inside fiscal jsonb for DB flexibility
    cest?: string;
    origem?: string;
    cst?: string; // or CSOSN
    cfop?: string;
    pisCst?: string;
    cofinsCst?: string;
    icmsPercent?: number;
};

export type ComboItem = {
    productId: string;
    variationId?: string;
    quantity: number;
    description: string;
    unitPrice: number;
    stock: number;
};

export type ExtraDimension = {
    label: string;
    value: string;
};

export type Product = {
    id?: string;
    code?: string;
    description: string;
    brand?: string;
    category?: string;
    categoryIds?: string[]; // IDs das categorias/subcategorias associadas
    condition?: 'novo' | 'usado' | 'salvado' | ''; // Condição do Móvel
    unitPrice: number;
    costPrice?: number; // Preço de custo base
    freightType?: 'fixed' | 'percentage';
    freightCost?: number; // Can be a fixed value or a percentage
    ipiPercent?: number;
    finalPurchasePrice?: number; // (costPrice + freight) * (1 + ipi/100) aprox.
    initialStock?: number;
    stock?: number;
    minStock?: number;
    unit: string;
    active: boolean;
    isDraft?: boolean;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    supplierId?: string;

    // Dimensions & Details
    width?: number;
    height?: number;
    depth?: number;
    extraDimensions?: ExtraDimension[];
    line?: string;
    mainDifferential?: string;
    material?: string;
    colors?: string;
    notIncluded?: string;

    // Ecommerce & Marketplace
    images?: string[];
    ecommerceDescription?: string;
    whatsappDescription?: string;
    ecommerceTemplate?: string;
    whatsappTemplate?: string;

    // Combo / Jogo
    isCombo?: boolean;
    comboItems?: ComboItem[];

    // Variations
    hasVariations?: boolean;
    variations?: Variation[];

    // Item Type
    itemType: 'product' | 'service';

    // UI Hierarchical fields (Synthetic)
    isParent?: boolean;
    isVariation?: boolean;
    parentId?: string;

    // Fiscal
    fiscal?: FiscalInfo;

    // Per-product notification configuration
    notificationConfig?: ProductNotificationConfig;
};

export type ProductNotificationConfig = {
    enabled: boolean;             // Master toggle — disable all alerts for this product
    notifyZeroStock: boolean;     // Alert when stock reaches 0
    notifyMinStock: boolean;      // Alert when stock reaches minStock threshold
    notifyCustom?: string;        // Optional: custom note about what to watch for this product
};

export type ProductVisibilitySettings = {
    code: boolean;
    description: boolean;
    category: boolean;
    costPrice: boolean;
    unitPrice: boolean;
    stock: boolean;
    createdAt: boolean;
    actions: boolean;
};

export default Product;
