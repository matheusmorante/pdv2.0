import CustomerData from "../types/customerData.type"
import { Item} from "../types/items.type";
import { Payment} from "../types/payments.type";
import { calcItemTotalValue, calcPaymentTotalValue } from "./calculations";

export const stringifyFullAddress = (
    { street, number, complement, neighborhood, city }
        : CustomerData['fullAddress']
) => {
    return [street, number, complement, neighborhood, city]
        .filter(Boolean)
        .join(', ')
};

export const stringifyFullAddressWithObservation = (
    { street, number, complement, observation, neighborhood, city }
        : CustomerData['fullAddress']
) => {
    return [street, number, complement, observation, neighborhood, city]
        .filter(Boolean)
        .join(', ')
};

export const stringifyItems = (items: Item[]) => {
    return items.map(item => `${item.description} (${item.quantity} UN)`)
        .join(', ')
};

export const stringifyItemsWithValues = (items: Item[]) => {
    return items.map(item => {
        const totalValue = calcItemTotalValue(item);
        return `${item.description} | ${item.quantity} UN | R$ ${totalValue}`

    }).join('\n')
};

export const stringifyPayments = (payments: Payment[]) => {
    return payments.map(payment => {
        const totalValue = calcPaymentTotalValue(payment);
        return `${payment.method} | R$ ${totalValue} | Status: ${payment.status}`
    }).join('\n')
}

export const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
    });
};

export const dateNow = () => {
    const now = new Date();

      return now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
    });
};
