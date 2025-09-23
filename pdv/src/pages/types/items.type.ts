type DiscountType = 'percentage' | 'fixed';

export type Item = {
    description: string;
    quantity: number;
    unitPrice: number;
    unitDiscount: number;
    discountType: DiscountType;
}

export type ItemsSummary = {
    totalQuantity: number,
    itemsSubtotal: number,
    totalFixedDiscount: number,
    itemsTotalValue: number
}

export default Item;
