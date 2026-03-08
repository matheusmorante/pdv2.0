import { calcPaymentsSummary, calcItemsSummary } from "./calculations";
import CustomerData from "../types/customerData.type";
import { Item } from "../types/items.type"
import { Payment } from "../types/payments.type";
import Shipping from "../types/Shipping.type";
import Order from "../types/order.type";

export type ValidationErrors = Record<string, string>;

export const validateItems = (items: Item[]): ValidationErrors => {
    const errors: ValidationErrors = {};
    items.forEach((item, idx) => {
        if (!item.description) {
            errors[`item_${idx}_description`] = "A descrição do item é obrigatória.";
        }
    });
    return errors;
}

export const validatePayments = (
    payments: Payment[],
    amountRemaining: number
): ValidationErrors => {
    const errors: ValidationErrors = {};

    payments.forEach((payment, idx) => {
        if (!payment.status) {
            errors[`payment_${idx}_status`] = "O status do pagamento é obrigatório.";
        }
    });

    if (Math.abs(amountRemaining) > 0.01) {
        if (amountRemaining > 0) {
            errors['payments_summary'] = `Ainda há R$ ${amountRemaining.toFixed(2).replace('.', ',')} a ser declarado.`;
        } else {
            errors['payments_summary'] = `O valor ultrapassou R$ ${Math.abs(amountRemaining).toFixed(2).replace('.', ',')}.`;
        }
    }

    return errors;
}

export const validateCustomerData = (customer: CustomerData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!customer) return { customer: "Dados do cliente ausentes." };

    if (!customer.fullName) errors['customer_fullName'] = "Nome completo é obrigatório.";
    if (!customer.noPhone && !customer.phone) errors['customer_phone'] = "Celular/WhatsApp é obrigatório.";

    const addr = customer.fullAddress;
    if (!addr) {
        errors['customer_address'] = "Endereço é obrigatório.";
    } else {
        if (!addr.street) errors['customer_street'] = "Rua é obrigatória.";
        if (!addr.number) errors['customer_number'] = "Número é obrigatório.";
        if (!addr.neighborhood) errors['customer_neighborhood'] = "Bairro é obrigatório.";
        if (!addr.city) errors['customer_city'] = "Cidade é obrigatória.";
    }

    return errors;
}

export const validateShipping = (shipping: Shipping): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!shipping) return { shipping: "Dados de entrega ausentes." };

    const scheduling = shipping.scheduling;
    if (!scheduling) {
        errors['shipping_scheduling'] = "Agendamento é obrigatório.";
    } else {
        if (!scheduling.date) errors['shipping_date'] = "Data de entrega é obrigatória.";
        if (!scheduling.startTime) errors['shipping_time'] = "Horário/Período é obrigatório.";
    }

    return errors;
}

export const validateSeller = (seller: Order['seller']): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!seller) errors['seller'] = "Vendedor é obrigatório.";
    return errors;
}

export const validateOrder = (order: Order): ValidationErrors => {
    if (!order) return { order: "Pedido não encontrado." };

    const items = order.items || [];
    const payments = order.payments || [];
    const shippingValue = order.shipping?.value || 0;

    const itemsSummary = calcItemsSummary(items);
    const { amountRemaining } = calcPaymentsSummary(
        payments,
        itemsSummary,
        shippingValue
    );

    return {
        ...validateItems(items),
        ...validateSeller(order.seller),
        ...validateShipping(order.shipping),
        ...validatePayments(payments, amountRemaining),
        ...validateCustomerData(order.customerData)
    };
}

// Keeping legacy validateBase for compatibility if needed, but updated to use new logic
export const validateBase = (order: Order) => {
    const errors = validateOrder(order);
    return Object.keys(errors).length === 0;
}

export const isOrderIncomplete = (order: Order) => {
    return !validateBase(order);
}

export const validateReviews = (order: Order): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!order || !order.customerData) return { order: "Dados insuficientes." };

    if (!order.customerData.fullName) {
        errors['customer_fullName'] = "Nome completo é obrigatório para o pedido de avaliação.";
    }
    return errors;
}
