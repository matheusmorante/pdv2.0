import Order from "../types/order.type";
import {
    stringifyFullAddress, stringifyFullAddressWithObservation,
    stringifyPayments, stringifyItemsWithValues, formatDate
} from "./fomatters";
import { getShippingRouteUrl } from "./maps";

export const shippingOrderWhatsappUrl = (order: Order) => {
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time;
    const customer = order.customerData;
    const message = `
____________________


*Novo Pedido para ${order.customerData.fullName}* 📦

𝐈𝐌𝐏𝐎𝐑𝐓𝐀𝐍𝐓:
${order.observation}

🗓️ *Agendamento:* 
${date} | ${time}

📞 *Contato:*
${customer.phone}

🏠 *Endereço:*
${stringifyFullAddressWithObservation(customer.fullAddress)}

📍🗺️ *Google Maps Rota:*
${getShippingRouteUrl(customer.fullAddress)}

🛒 *Itens:*
${stringifyItemsWithValues(order.items)}

💰 *Total:* R$ ${order.paymentsSummary.totalOrderValue}

💳 *Pagamento:* 
${stringifyPayments(order.payments)}

Vendido por ${order.seller}
`;

    return `https://api.whatsapp.com/send?phone=&text=${encodeURIComponent(message)}`;
}

export const customerOrderWhatsappUrl = (order: Order) => {
    const date = formatDate(order.shipping.scheduling.date);
    const time = order.shipping.scheduling.time;
    const customer = order.customerData;
    const message = `
*Ola ${order.customerData.fullName}, seu pedido foi confirmado!* 📦

🗓️ *Anote ai, a sua entrega está agendada para:* 
${date} | ${time}

🏠 *Endereço:*
${stringifyFullAddress(customer.fullAddress)}

🛒 *Itens:*
${stringifyItemsWithValues(order.items)}

*Valor Total do Pedido:* 
R$ ${order.paymentsSummary.totalOrderValue}

💳 *Pagamento:* 
${stringifyPayments(order.payments)}
`;

    return `https://wa.me/${customer.phone}&text=${encodeURIComponent(message)}`;
}