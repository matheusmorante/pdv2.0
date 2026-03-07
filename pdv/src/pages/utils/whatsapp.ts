import Order from "../types/pdvAction.type";
import { getSettings } from "./settingsService";
import {
    stringifyFullAddress, stringifyFullAddressWithObservation,
    stringifyPayments, stringifyItemsWithValues, formatDate
} from "./formatters";
import { getShippingRouteUrl } from "./maps";

export const shippingOrderWhatsappUrl = (order: Order) => {
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time || "Não informado";
    const customer = order.customerData;
    const message = `
____________________


*Novo Pedido para ${customer.fullName || "Cliente"}* 📦

𝐈𝐌𝐏𝐎𝐑𝐓𝐀𝐍𝐓:
${order.observation || "Sem observações"}

🗓️ *Agendamento:* 
${date} | ${time}

📞 *Contato:*
${customer.phone || "Não informado"}

🏠 *Endereço:*
${stringifyFullAddressWithObservation(customer.fullAddress)}

🛒 *Itens:*
${stringifyItemsWithValues(order.items || [])}

*Valor do Frete:*
${order.shipping.value === 0 ? "*FRETE GRÁTIS*" : `R$ ${order.shipping.value}`}

*Valor do Juros:*
R$ ${order.paymentsSummary.totalPaymentsFee || 0}

💰 *Total:* R$ ${order.paymentsSummary.totalOrderValue || 0}

💳 *Pagamento:* 
${stringifyPayments(order.payments || [])}

📍🗺️ *Google Maps Rota:*
${customer.fullAddress ? getShippingRouteUrl(customer.fullAddress) : "Endereço não informado"}

Vendido por ${order.seller || "Não informado"}
`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export const customerOrderWhatsappUrl = (order: Order) => {
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time || "Não informado";
    const customer = order.customerData;
    const phone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const message = `
*Olá ${customer.fullName || "Cliente"}, seu pedido foi confirmado!* 📦

*Anote aí, a sua entrega está agendada para:* 
${date} | ${time}

*Endereço:*
${stringifyFullAddress(customer.fullAddress)}

*Itens:*
${stringifyItemsWithValues(order.items || [])}

*Valor do Frete:*
${order.shipping.value === 0 ? "*FRETE GRÁTIS*" : `R$ ${order.shipping.value}`}

*Valor do Juros:*
R$ ${order.paymentsSummary.totalPaymentsFee || 0}

*Valor Total do Pedido:* 
R$ ${order.paymentsSummary.totalOrderValue || 0}

*Pagamento:* 
${stringifyPayments(order.payments || [])}
`;

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
    const message = `Muito obrigado pela sua compra!

Quando puder, avalie a sua compra e o atendimento para que possamos estar sempre melhorando a nossa qualidade. Para isso, clique no link abaixo:
${reviewUrl}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}