import { calcPaymentsSummary } from "./calculations";
import CustomerData from "../types/customerData.type";
import { Item } from "../types/items.type"
import { Payment, PaymentsSummary } from "../types/payments.type";
import { toast } from 'react-toastify';
import Shipping from "../types/Shipping.type";
import Order from "../types/pdvAction.type";
import { calcItemsSummary } from "../PdvPage/pdvUtils";

export const validateItems = (items: Item[]) => {
    for (const item of items) {
        if (!item.description) {
            toast.error("O campo 'Descrição' do item é obrigatório.")
            return false
        }
        return true
    };
    return null
}

export const validatePayments = (
    payments: Payment[], amountRemaining: PaymentsSummary['amountRemaining']
) => {
    for (const payment of payments) {
        if (!payment.status) {
            toast.error("O campo 'Status' do pagamento é obrigatório.")
            return false
        }
        return true
    };

    if (amountRemaining >= 0) {
        toast.error(`Ainda há R$ ${amountRemaining} a ser declarado para o
             pagamento.`)
        return false
    }
    return true
}

export const validateCustomerData = (customer: CustomerData, mode: 'order' | 'receipt') => {
    if (!customer.fullName) {
        toast.error("O campo 'Nome Completo' é obrigatório para o pedido de entrega.")
        return false
    }

    if (!customer.phone) {
        toast.error("O campo 'Celular/Telefone' é obrigatório para o pedido de entrega.")
        return false
    }

    if (!customer.fullAddress.street) {
        toast.error("O campo 'Rua' do endereço é obrigatório para o pedido de entrega.")
        return false
    }

    if (!customer.fullAddress.number) {
        toast.error("O campo 'Número' do endereço é obrigatório para o pedido de entrega.")
        return false
    }

    if (!customer.fullAddress.neighborhood) {
        toast.error("O campo 'Bairro' do endereço é obrigatório para o pedido de entrega.")
        return false
    }

    if (!customer.fullAddress.city) {
        toast.error("O campo 'Cidade' do endereço é obrigatório para o pedido de entrega.")
        return false
    }

    return true
}

export const validateShipping = (shipping: Shipping) => {

    if (shipping.scheduling.date === '') {
        toast.error("O campo 'Data' do agendamento da entrega é obrigatório.")
        return false
    }

    if (!shipping.scheduling.time) {
        toast.error("O campo 'Período' do agendamento da entrega é obrigatório.")
        return false
    }

    return true

}

export const validateSeller = (seller: Order['seller']) => {

    if (!seller) {
        toast.error("O campo 'Vendedor'é obrigatório.")
        return false
    }

    return true

}

export const validateOrder = (order: Order) => {
    const itemsSummary = calcItemsSummary(order.items);
    const { amountRemaining } = calcPaymentsSummary(
        order.payments, itemsSummary, order.shipping.value
    );

    if (
        !validateItems(order.items) ||
        !validateSeller(order.seller) ||
        !validateShipping(order.shipping) ||
        !validatePayments(order.payments, amountRemaining) ||
        !validateCustomerData(order.customerData)
    ) return false

    return true
}

export const validateReceipt = (order: Order) => {
    const itemsSummary = calcItemsSummary(order.items);
    const { amountRemaining } = calcPaymentsSummary(
        order.payments, itemsSummary, order.shipping.value
    );

    if (
        !validateItems(order.items) ||
        !validateSeller(order.seller) ||
        !validateShipping(order.shipping) ||
        !validatePayments(order.payments, amountRemaining) ||
        !validateCustomerData(order.customerData)
    ) return false

    return true
}

export const validateReviews = (order: Order) => {
    if (!order.customerData.fullName) {
        toast.error("O campo 'Nome Completo' é obrigatório para o Recibo.")
        return false
    }

    return true
}