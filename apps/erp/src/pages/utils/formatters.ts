import CustomerData from "../types/customerData.type"
import { Item } from "../types/items.type";
import { Payment } from "../types/payments.type";
import Order from "../types/order.type";
import Person from "../types/person.type";
import { calcItemTotalValue, calcPaymentTotalValue } from "./calculations";

export const stringifyFullAddress = (
    address: CustomerData['fullAddress'] | null | undefined
) => {
    if (!address) return '';
    const { street, number, complement, neighborhood, city } = address;
    return [street, number, complement, neighborhood, city]
        .filter(Boolean)
        .join(', ')
};

export const stringifyFullAddressWithObservation = (
    address: CustomerData['fullAddress'] | null | undefined
) => {
    if (!address) return '';
    const { street, number, complement, observation, neighborhood, city } = address;
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

export const formatToBRDate = (value: string | undefined | null) => {
    if (!value) return "-";
    if (value.includes('/') && value.length >= 8) return value; // Already formatted

    // If it's YYYY-MM-DD, handle it carefully to avoid timezone shifts
    if (value.includes('-') && value.length >= 10) {
        const parts = value.split('T')[0].split('-');
        if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d}/${m}/${y}`;
        }
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

export const formatDateTime = (value: string | undefined | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const formatDate = (value: string) => {
    if (!value) return "Não agendado";
    if (value.includes('/') && value.length >= 8) return value; // Already formatted

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
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
        fullName: toTitleCase(data.fullName || ""),
        fullAddress: data.fullAddress ? {
            ...data.fullAddress,
            street: toTitleCase(data.fullAddress.street || ""),
            complement: toTitleCase(data.fullAddress.complement || ""),
            neighborhood: toTitleCase(data.fullAddress.neighborhood || ""),
            city: toTitleCase(data.fullAddress.city || ""),
            observation: toTitleCase(data.fullAddress.observation || ""),
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
            description: item.description?.toUpperCase() || ""
        }))
    };
};

export const capitalizePerson = (person: Person): Person => {
    if (!person) return person;

    return {
        ...person,
        fullName: toTitleCase(person.fullName || ""),
        tradeName: person.tradeName ? toTitleCase(person.tradeName) : person.tradeName,
        fullAddress: person.fullAddress ? {
            ...person.fullAddress,
            street: toTitleCase(person.fullAddress.street || ""),
            complement: toTitleCase(person.fullAddress.complement || ""),
            neighborhood: toTitleCase(person.fullAddress.neighborhood || ""),
            city: toTitleCase(person.fullAddress.city || ""),
            observation: toTitleCase(person.fullAddress.observation || ""),
        } : person.fullAddress
    };
};
