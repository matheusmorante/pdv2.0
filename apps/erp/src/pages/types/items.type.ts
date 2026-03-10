type DiscountType = 'percentage' | 'fixed';

export type Item = {
    productId?: string;
    variationId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    unitDiscount: number;
    discountType: DiscountType;
    handlingType: string;
    condition?: 'novo' | 'usado' | 'salvado' | '';
    deliveryMethod?: 'delivery' | 'pickup';
}

export type ItemsSummary = {
    totalQuantity: number,
    itemsSubtotal: number,
    totalFixedDiscount: number,
    itemsTotalValue: number
}

export default Item;
