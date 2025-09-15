import { calcItemsTotalValue } from "./form/ItemsTable/utils";
import { Item, ItemsSummary } from "./types/items.type";
import { PaymentsData } from "./types/payments.type";
import Shipping from "./types/Shipping.type";

export const calcItemsSummary = (items: Item[]) => {
    const totalQuantity = sumKeyValues(items, 'quantity');
    const totalDiscount = items.reduce((acc, item) => {
        return acc + (item.fixedDiscount * item.quantity)
    }, 0);
    const itemsTotalValue = calcItemsTotalValue(items);
    const itemsSubtotal = itemsTotalValue + totalDiscount;

    return {
        totalQuantity,
        itemsSubtotal,
        totalDiscount,
        itemsTotalValue,
    }
}

export const calcPaymentSummary = (
    paymentsData: PaymentsData,
    itemsSummary: ItemsSummary,
    shippingValue: Shipping['value']
) => {
    const payments = paymentsData.list;
    const interest = paymentsData.interest;

    const totalOrderValue = itemsSummary.itemsTotalValue + interest
        + shippingValue;
    const totalAmountPaid = sumKeyValues(payments, 'amount');
    const amountRemaining = totalOrderValue;

    return {
        totalOrderValue,
        totalAmountPaid,
        amountRemaining
    }
}

export const percentToValue = (price: number, discountPercent: number) => {
    const p = price || 0;
    const d = discountPercent || 0;

    if (discountPercent === 0) {
        return discountPercent
    }

    return +(p * (d / 100)).toFixed(4);
};

export const valueToPercent = (price: number, discountValue: number) => {
    const p = price || 0;
    const d = discountValue || 0;

    if (discountValue === 0) {
        return discountValue
    }

    return +(d / p * 100).toFixed(4);
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

export const currencyToNumber = (currency: string) => {
    return Number(currency
        .replace('.', '')
        .replace(',', '.')
        .replace('R$ ', '')
        .replace(' un', '')
        .replace(' %', '')
    );
}

