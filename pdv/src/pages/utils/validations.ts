import { calcPaymentsSummary } from "./calculations";
import CustomerData from "../types/customerData.type";
import { Item } from "../types/items.type"
import { Payment, PaymentsSummary } from "../types/payments.type";
import { toast } from 'react-toastify';
import Shipping from "../types/Shipping.type";
import Order from "../types/pdvAction.type";
import { calcItemsSummary } from "../PdvPage/pdvUtils";

const requiredField = (value: any, msg: string) => {
    if (!value) {
        toast.error(msg)
        return false
    }
    return true
}

export const validateItems = (items: Item[]) => {
    for (const item of items) {
        if (!requiredField(
            item.description, "O campo 'Descrição' do item é obrigatório."
        )) {
            return false
        }
        return true
    };
    return true
}

export const validatePayments = (
    payments: Payment[], amountRemaining: PaymentsSummary['amountRemaining']
) => {
    for (const payment of payments) {
        if (!requiredField(
            payment.status, "O campo 'Status' do pagamento é obrigatório."
        )) {
            return false
        }

        
        return true
    };

    if (amountRemaining >= 0) {
        toast.error(
            `Ainda há R$ ${amountRemaining} a ser declarado para o
             pagamento.`
        )
        return false
    }

    return true
}

export const validateCustomerData = (customer: CustomerData) => {
    return (
        requiredField(customer.fullName, "O campo 'Nome Completo' é obrigatório.") &&
        requiredField(customer.phone, "O campo 'Celular/Telefone' é obrigatório.") &&
        requiredField(customer.fullAddress.street, "O campo 'Rua' do endereço é obrigatório.") &&
        requiredField(customer.fullAddress.number, "O campo 'Número' do endereço é obrigatório.") &&
        requiredField(customer.fullAddress.neighborhood, "O campo 'Bairro' do endereço é obrigatório.") &&
        requiredField(customer.fullAddress.city, "O campo 'Cidade' do endereço é obrigatório.")
    )
}

export const validateShipping = (shipping: Shipping) => {
    const scheduling = shipping.scheduling;
    return (
        requiredField(scheduling.date, "O campo 'Data' é obrigatório.") &&
        requiredField(scheduling.time, "O campo 'Período' é obrigatório.")
    )
}

export const validateSeller = (seller: Order['seller']) => {
    return requiredField(seller, "O campo 'Vendedor' é obrigatório.")
}

export const validateBase = (order: Order) => {
    const itemsSummary = calcItemsSummary(order.items);
    const { amountRemaining } = calcPaymentsSummary(
        order.payments, 
        itemsSummary, 
        order.shipping.value
    );

    return (
        validateItems(order.items) ||
        validateSeller(order.seller) ||
        validateShipping(order.shipping) ||
        validatePayments(order.payments, amountRemaining) ||
        validateCustomerData(order.customerData)
    )
}

export const validateReviews = (order: Order) => {
    return requiredField(
        order.customerData.fullName,
        "O campo 'Nome Completo' é obrigatório para o pedido de avaliação."
    )
}