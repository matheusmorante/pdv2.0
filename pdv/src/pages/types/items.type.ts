type DiscountType = 'percentage' | 'fixed';

export type Item = {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    discountType: DiscountType;
}

export type ItemsSummary = {
    totalQuantity: number,
    itemsSubtotal: number,
    totalFixedDiscount: number,
    itemsTotalValue: number
}

export default Item;
