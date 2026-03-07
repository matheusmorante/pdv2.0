export type Variation = {
    id: string;
    sku: string;
    name: string; // e.g., "Cor: Azul, Tamanho: P"
    stock: number;
    unitPrice: number;
    costPrice?: number;
    active: boolean;
    attributes: { name: string; value: string }[];
    syncWithParent?: boolean;
};

export type FiscalInfo = {
    ncm?: string;
    cest?: string;
    origem?: string;
    cst?: string; // or CSOSN
    cfop?: string;
    pisCst?: string;
    cofinsCst?: string;
    icmsPercent?: number;
};

export type Product = {
    id?: string;
    code?: string;
    description: string;
    category?: string;
    unitPrice: number;
    costPrice?: number; // Preço de custo base
    freightCost?: number;
    ipiPercent?: number;
    finalPurchasePrice?: number; // (costPrice + freight) * (1 + ipi/100) aprox.
    initialStock?: number;
    stock?: number;
    minStock?: number;
    unit: string;
    active: boolean;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    supplierId?: string;
    
    // Ecommerce
    images?: string[];
    ecommerceDescription?: string;
    
    // Variations
    hasVariations?: boolean;
    variations?: Variation[];
    
    // Item Type
    itemType: 'product' | 'service';
    
    // Fiscal
    fiscal?: FiscalInfo;
};

export type ProductVisibilitySettings = {
    code: boolean;
    description: boolean;
    category: boolean;
    unitPrice: boolean;
    stock: boolean;
    unit: boolean;
    actions: boolean;
};

export default Product;
