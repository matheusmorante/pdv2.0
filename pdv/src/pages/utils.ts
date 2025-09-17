import CustomerData from "./types/customerData.type"
import { Item, ItemsSummary } from "./types/items.type";
import { PaymentsData } from "./types/payments.type";
import Shipping from "./types/Shipping.type";

export const calcItemsTotalValue = (items: Item[]) => {
    return items.reduce((acc, item) => {
        return acc + calcItemTotalValue(item)
    }, 0)
};

export const getFixedDiscount = (item: Item) => {
    if(item.discountType === 'fixed') return item.discount;
    else return (item.unitPrice * item.quantity * item.discount) / 100;
};

export function sumKeyValues<T extends Record<string, any>>(
    array: T[],
    key: keyof T
): number {
    return array.reduce((acc, item) => {
        const value = item[key];
        return acc + (typeof value === "number" ? value : 0);
    }, 0);
};

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
    const amountRemaining = totalOrderValue - totalAmountPaid;

    return {
        totalOrderValue,
        totalAmountPaid,
        amountRemaining
    }
};

export const calcItemTotalValue = (item: Item) => {
   if (item.discountType === 'fixed') {
        return (item.unitPrice - item.discount) * item.quantity;
    } else if (item.discountType === 'percentage') {
        return item.unitPrice * item.quantity * (1 - item.discount / 100);
    } else {
        return item.unitPrice * item.quantity;
    }
};

export const stringifyFullAddress = (
    { street, number, complement, neighborhood, city }
        : CustomerData['fullAddress']
) => {
    return [street, number, complement, neighborhood, city]
        .filter(Boolean)
        .join(', ')
};

export const stringifyItems = (items: Item[]) => {
    return items.map(item => `${item.description} (${item.quantity} UN)`)
        .join(', ')
};

export const dateNow = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
     const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      
      return `${day}/${month}/${year}`
};

export const formatDate = (value: Date) => {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};


