import Order from "../types/order.type";
import { getSettings } from "./settingsService";
import {
    stringifyFullAddress, stringifyFullAddressWithObservation,
    stringifyPayments, stringifyItemsWithValues, formatDate
} from "./formatters";
import { getShippingRouteUrl } from "./maps";

export const shippingOrderWhatsappUrl = (order: Order) => {
    const settings = getSettings();
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time || "Não informado";
    const customer = order.customerData;
    
    let message = settings.whatsappTemplates?.deliveryInfo || "";
    
    if (!message) {
        // Fallback to hardcoded if template is empty
        message = `Novo Pedido para ${customer.fullName || "Cliente"}...`; 
    }

    message = message
        .replace(/{{customerName}}/g, customer.fullName || "Cliente")
        .replace(/{{deliveryDate}}/g, date)
        .replace(/{{deliveryTime}}/g, time)
        .replace(/{{phone}}/g, customer.phone || "Não informado")
        .replace(/{{address}}/g, stringifyFullAddressWithObservation(customer.fullAddress))
        .replace(/{{items}}/g, stringifyItemsWithValues(order.items || []))
        .replace(/{{totalValue}}/g, (order.paymentsSummary.totalOrderValue || 0).toString())
        .replace(/{{observation}}/g, order.observation || "Sem observações")
        .replace(/{{routeUrl}}/g, customer.fullAddress ? getShippingRouteUrl(customer.fullAddress) : "Endereço não informado");

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export const customerOrderWhatsappUrl = (order: Order) => {
    const settings = getSettings();
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time || "Não informado";
    const customer = order.customerData;
    const phone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    
    let message = settings.whatsappTemplates?.orderConfirmation || "";
    
    message = message
        .replace(/{{customerName}}/g, customer.fullName || "Cliente")
        .replace(/{{deliveryDate}}/g, date)
        .replace(/{{deliveryTime}}/g, time)
        .replace(/{{address}}/g, stringifyFullAddress(customer.fullAddress))
        .replace(/{{items}}/g, stringifyItemsWithValues(order.items || []))
        .replace(/{{totalValue}}/g, (order.paymentsSummary.totalOrderValue || 0).toString())
        .replace(/{{payments}}/g, stringifyPayments(order.payments || []));

    if (phone) {
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export const customerReviewsWhatsappUrl = (order: Order) => {
    const customer = order.customerData;
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const settings = getSettings();
    const reviewUrl = settings.googleReviewUrl || 'https://g.page/r/CctxeFYzY2o8EBE/review';
    
    let message = settings.whatsappTemplates?.reviewRequest || "";
    
    message = message
        .replace(/{{cliente}}/g, customer.fullName?.split(' ')[0] || "Cliente")
        .replace(/{{reviewUrl}}/g, reviewUrl);

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}