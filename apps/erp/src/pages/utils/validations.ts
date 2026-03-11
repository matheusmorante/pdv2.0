import { calcPaymentsSummary, calcItemsSummary } from "./calculations";
import { getSettings } from "./settingsService";
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
        // User feedback: Must select from search, not just type
        if (!item.productId) {
            errors[`item_${idx}_description`] = "Selecione um produto da busca/lista.";
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
    const { requiredFields } = getSettings();

    if (!customer) return { customer: "Dados do cliente ausentes." };

    if (!customer.fullName || !customer.fullName.trim()) {
        errors['customer_fullName'] = "Nome completo é obrigatório.";
    }

    if (requiredFields.customer?.phone && (!customer.phone || !customer.phone.trim())) {
        errors['customer_phone'] = "Telefone/Celular é obrigatório.";
    }

    if (requiredFields.customer?.cpfCnpj && (!customer.cpfCnpj || !customer.cpfCnpj.trim())) {
        errors['customer_cpfCnpj'] = "CPF/CNPJ é obrigatório.";
    }

    if (requiredFields.customer?.email && (!customer.email || !customer.email.trim())) {
        errors['customer_email'] = "Email é obrigatório.";
    }

    if (requiredFields.customer?.rgIe && (!(customer as any).rgIe || !(customer as any).rgIe.trim())) {
        errors['customer_rgIe'] = "RG/IE é obrigatório.";
    }

    if (requiredFields.customer?.position && (!(customer as any).position || !(customer as any).position.trim())) {
        errors['customer_position'] = "Cargo/Ocupação é obrigatório.";
    }

    if (requiredFields.customer?.address) {
       const addr = customer.fullAddress;
       if (!addr?.street || !addr?.number || !addr?.neighborhood || !addr?.city) {
           errors['customer_address'] = "Endereço completo é obrigatório.";
       }
    }

    return errors;
}

export const validateShipping = (shipping: Shipping, customer: CustomerData): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!shipping) return { shipping: "Dados de entrega ausentes." };

    const scheduling = shipping.scheduling;
    if (!scheduling) {
        errors['shipping_scheduling'] = "Agendamento é obrigatório.";
    } else {
        if (!scheduling.date) errors['shipping_date'] = "Data de entrega é obrigatória.";
        if (!scheduling.startTime) errors['shipping_time'] = "Horário/Período é obrigatório.";
    }

    if (shipping.deliveryMethod === 'delivery') {
        if (shipping.useCustomerAddress !== false) {
            // Using customer address
            const addr = customer?.fullAddress;
            if (!addr?.street) errors['customer_street'] = "Rua é obrigatória (Cadastro do Cliente).";
            if (!addr?.number) errors['customer_number'] = "Número é obrigatório (Cadastro do Cliente).";
            if (!addr?.neighborhood) errors['customer_neighborhood'] = "Bairro é obrigatório (Cadastro do Cliente).";
            if (!addr?.city) errors['customer_city'] = "Cidade é obrigatória (Cadastro do Cliente).";
        } else {
            // Using custom delivery address
            const dAddr = shipping.deliveryAddress;
            if (!dAddr?.street) errors['deliveryAddress_street'] = "Rua é obrigatória (Endereço de Entrega).";
            if (!dAddr?.number) errors['deliveryAddress_number'] = "Número é obrigatório (Endereço de Entrega).";
            if (!dAddr?.neighborhood) errors['deliveryAddress_neighborhood'] = "Bairro é obrigatório (Endereço de Entrega).";
            if (!dAddr?.city) errors['deliveryAddress_city'] = "Cidade é obrigatória (Endereço de Entrega).";
        }
    }

    return errors;
}

export const validateSeller = (seller: Order['seller']): ValidationErrors => {
    const errors: ValidationErrors = {};
    const { requiredFields } = getSettings();
    if (requiredFields.salesOrder?.seller && !seller) {
        errors['seller'] = "Vendedor é obrigatório.";
    }
    return errors;
}

export const validateOrder = (order: Order): ValidationErrors => {
    if (!order) return { order: "Pedido não encontrado." };

    const items = order.items || [];
    const payments = order.payments || [];
    const shippingValue = order.shipping?.value || 0;
    const isDraft = order.status === 'draft';

    const itemsSummary = calcItemsSummary(items);
    const { amountRemaining } = calcPaymentsSummary(
        payments,
        itemsSummary,
        shippingValue
    );

    const errors: ValidationErrors = {
        ...validateItems(items),
        ...validateCustomerData(order.customerData)
    };

    // If it's not a draft, we require full validation
    if (!isDraft) {
        Object.assign(errors, {
            ...validateSeller(order.seller),
            ...validateShipping(order.shipping, order.customerData),
            ...validatePayments(payments, amountRemaining)
        });

        // Validate items presence for non-drafts
        if (items.length === 0) {
            errors['items_summary'] = "O pedido deve conter pelo menos um item para ser finalizado.";
        }
    }

    // Order Date is always important but for draft we could potentially skip it if we auto-fill, 
    // but here let's keep it as is or fill it in the service.
    if (!order.date || order.date.trim() === '') {
        errors['order_date'] = "A data do pedido é obrigatória.";
    }

    return errors;
}

// Keeping legacy validateBase for compatibility if needed, but updated to use new logic
export const validateBase = (order: Order) => {
    const errors = validateOrder(order);
    return Object.keys(errors).length === 0;
}

export const validateAssistanceOrder = (order: Order): ValidationErrors => {
    const errors: ValidationErrors = {};
    const { requiredFields } = getSettings();

    if (!order.customerData?.fullName && requiredFields.assistanceOrder?.customer) {
        errors['customer_fullName'] = "Nome do cliente é obrigatório.";
    }

    if (requiredFields.customer?.phone && (!order.customerData?.phone || !order.customerData.phone.trim())) {
        errors['customer_phone'] = "Telefone é obrigatório.";
    }

    if (!order.assistanceDescription) {
        errors['assistanceDescription'] = "Descrição do serviço é obrigatória.";
    }

    if (!order.seller && requiredFields.assistanceOrder?.seller) {
        errors['seller'] = "Vendedor é obrigatório.";
    }

    if (order.scheduledDate || order.scheduledTime) {
        if (!order.scheduledDate) errors['shipping_date'] = "Data é obrigatória.";
        if (!order.scheduledTime) errors['shipping_time'] = "Horário é obrigatório.";
    }

    return errors;
};

export const isOrderIncomplete = (order: Order) => {
    if (!order) return true;
    // Assistance orders have different required fields
    if (order.orderType === 'assistance') {
        return Object.keys(validateAssistanceOrder(order)).length > 0;
    }
    // All other order types use the full validation
    return !validateBase(order);
};

export const validateReviews = (order: Order): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!order || !order.customerData) return { order: "Dados insuficientes." };

    if (!order.customerData.fullName) {
        errors['customer_fullName'] = "Nome completo é obrigatório para o pedido de avaliação.";
    }
    return errors;
}
