export type PurchaseItem = {
    productId: string;
    variationId?: string;
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
};

export type Purchase = {
    id?: string;
    supplierId: string;
    supplierName: string;
    date: string;
    items: PurchaseItem[];
    totalValue: number;
    observation?: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt?: string;
};

export default Purchase;
