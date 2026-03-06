import Order, { PdvAction, IsButtonsClicked } from "../../../types/pdvAction.type";
// Note: If orderPdf is missing, we keep the console.log placeholder
// import { handleDownloadPdf } from "../../../utils/reports/orderPdf";

export const actionsMap: Record<PdvAction, (order: Order) => void> = {
    'PRINT_RECEIPT': (order) => {
        console.log("Gerando Recibo para o pedido:", order.id);
    },
    'PRINT_SHIPPING_ORDER': (order) => {
        console.log("Gerando Pedido de Entrega para o pedido:", order.id);
    },
    'PRINT_WARRANTY_TERM': (order) => {
        console.log("Gerando Termo de Garantia para o pedido:", order.id);
    },
    'SEND_SHIPPING_ORDER': (order) => {
        const message = `*Confirmação de Entrega*%0A%0AOlá! Seu pedido de entrega foi registrado.%0A%0A*Itens:*%0A${order.items
            .map((item) => `- ${item.description} (Qtd: ${item.quantity})`)
            .join("%0A")}%0A%0A*Total:* ${order.paymentsSummary.totalOrderValue || 0
            }%0A%0AObrigado!`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    },
    'SEND_CUSTOMER_ORDER': (order) => {
        const message = `*Detalhes do Pedido*%0A%0AOlá! Aqui estão os detalhes do seu pedido.%0A%0A*Total:* ${order.paymentsSummary.totalOrderValue || 0
            }%0A%0AStatus: Em Preparação.`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    },
    'SEND_CUSTOMER_REVIEWS': (order) => {
        const message = `*Avaliação do Pedido*%0A%0AOlá! Poderia nos avaliar?`;
        window.open(`https://wa.me/?text=${message}`, "_blank");
    }
};

export interface PdvButton {
    key: keyof IsButtonsClicked;
    icon: string;
    action: PdvAction;
    label: string;
    color: string;
}

export const buttons: PdvButton[] = [
    {
        key: "printShippingOrder",
        icon: "bi-printer-fill",
        action: "PRINT_SHIPPING_ORDER",
        label: "Imprimir Pedido",
        color: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
    {
        key: "sendShippingOrder",
        icon: "bi-truck",
        action: "SEND_SHIPPING_ORDER",
        label: "Enviar Entrega",
        color: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
    {
        key: "sendCustomerOrder",
        icon: "bi-whatsapp",
        action: "SEND_CUSTOMER_ORDER",
        label: "WhatsApp Cliente",
        color: "bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-200 transition-all font-bold text-xs uppercase tracking-widest px-6 py-3"
    },
];
