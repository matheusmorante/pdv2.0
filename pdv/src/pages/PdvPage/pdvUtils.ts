import { sumKeyValues, getFixedDiscount, calcItemsTotalValue } from "../utils/calculations";
import { Item } from "../types/items.type";
export const calcItemsSummary = (items: Item[]) => {
    const totalQuantity = sumKeyValues(items, 'quantity');
    const totalFixedDiscount = items.reduce((acc, item) => {
        const discount = getFixedDiscount(item);
        return acc + (discount * item.quantity)
    }, 0);
    const itemsTotalValue = calcItemsTotalValue(items);
    const itemsSubtotal = itemsTotalValue + totalFixedDiscount;

    return {
        totalQuantity,
        itemsSubtotal,
        totalFixedDiscount,
        itemsTotalValue,
    }
}

export const currencyToNumber = (currency: string) => {
    const num = Number(currency.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
}

