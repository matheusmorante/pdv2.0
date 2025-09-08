import { Item } from "../types/item.type";


export const itemTotalValue = (item: Item) => {
    console.log(item)
    const subtotal = item.price * item.quantity;
    const discountValue = item.discountIsPercentage
        ? subtotal * item.discount / 100
        : item.discount;
    return +(subtotal - discountValue).toFixed(2);
};

export function sumKeyValues<T extends Record<string, any>>(
    array: T[],
    key: keyof T
): number {
    return array.reduce((acc, item) => {
        const value = item[key];
        return acc + (typeof value === "number" ? value : 0);
    }, 0);
}