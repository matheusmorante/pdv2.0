import CustomerData from "../types/customerData.type"
import { Item } from "../types/items.type";
import { Payment } from "../types/payments.type";
import Order from "../types/order.type";
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
    if (!value) return "Não agendado";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
    });
};

export const toTitleCase = (text: string) => {
    if (!text) return "";
    const exceptions = ["de", "da", "do", "das", "dos", "com", "em"];
    return text
        .toLowerCase()
        .split(" ")
        .map((word, index) => {
            if (exceptions.includes(word) && index !== 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
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

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);
};

export const capitalizeCustomerData = (data: CustomerData): CustomerData => {
    if (!data) return data;

    return {
        ...data,
        fullName: toTitleCase(data.fullName),
        fullAddress: data.fullAddress ? {
            ...data.fullAddress,
            street: toTitleCase(data.fullAddress.street),
            complement: toTitleCase(data.fullAddress.complement),
            neighborhood: toTitleCase(data.fullAddress.neighborhood),
            city: toTitleCase(data.fullAddress.city),
            observation: toTitleCase(data.fullAddress.observation),
        } : data.fullAddress
    };
};

export const capitalizeOrder = (order: Order): Order => {
    if (!order) return order;

    return {
        ...order,
        customerData: capitalizeCustomerData(order.customerData),
        items: order.items?.map(item => ({
            ...item,
            description: toTitleCase(item.description)
        }))
    };
};
