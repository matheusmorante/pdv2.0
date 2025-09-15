export type Item = {
    description: string;
    quantity: number;
    unitPrice: number;
    fixedDiscount: number;
    percentDiscount: number;
}

export type ItemsSummary = {
    totalQuantity: number,
    itemsSubtotal: number,
    totalDiscount: number,
    itemsTotalValue: number
}

export default Item;
