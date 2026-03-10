import Order, { OrderAction, IsButtonsClicked } from "../../../types/order.type";

import { 
    shippingOrderWhatsappUrl, 
    customerOrderWhatsappUrl, 
    customerReviewsWhatsappUrl 
} from "../../../utils/whatsapp";

export const actionsMap: Record<OrderAction, (order: Order) => void> = {
    'PRINT_RECEIPT': (order) => {
        sessionStorage.setItem('order', JSON.stringify(order));
        window.open('/receipt', '_blank');
    },
    'PRINT_SHIPPING_ORDER': (order) => {
        sessionStorage.setItem("order", JSON.stringify(order));
        window.open("/order", "_blank");
    },
    'PRINT_WARRANTY_TERM': (order) => {
        console.log("Gerando Termo de Garantia para o pedido:", order.id);
    },
    'SEND_SHIPPING_ORDER': (order) => {
        window.open(shippingOrderWhatsappUrl(order), "_blank");
    },
    'SEND_CUSTOMER_ORDER': (order) => {
        window.open(customerOrderWhatsappUrl(order), "_blank");
    },
    'SEND_CUSTOMER_REVIEWS': (order) => {
        window.open(customerReviewsWhatsappUrl(order), "_blank");
    },
    'STOCK_WITHDRAWAL': () => {
        // Handled in UI to show modal
    },
    'STOCK_REVERSAL': () => {
        // Handled in UI to show modal
    }
};

export interface OrderButton {
    key: keyof IsButtonsClicked;
    icon: string;
    action: OrderAction;
    label: string;
    color: string;
    tooltip: string; // Added tooltip field
}

export const buttons: OrderButton[] = [
    {
        key: "printShippingOrder",
        icon: "bi-printer-fill",
        action: "PRINT_SHIPPING_ORDER",
        label: "Imprimir Pedido",
        color: "text-blue-600 hover:bg-blue-50",
        tooltip: "Imprimir Pedido de Venda"
    },
    {
        key: "printReceipt",
        icon: "bi-receipt",
        action: "PRINT_RECEIPT",
        label: "Imprimir Recibo",
        color: "text-slate-600 hover:bg-slate-50",
        tooltip: "Gerar Recibo do Cliente"
    },
    {
        key: "sendShippingOrder",
        icon: "bi-truck",
        action: "SEND_SHIPPING_ORDER",
        label: "Enviar Entrega",
        color: "text-orange-500 hover:bg-orange-50",
        tooltip: "Enviar detalhes da entrega via WhatsApp"
    },
    {
        key: "sendCustomerOrder",
        icon: "bi-whatsapp",
        action: "SEND_CUSTOMER_ORDER",
        label: "WhatsApp Cliente",
        color: "text-green-600 hover:bg-green-50",
        tooltip: "Enviar confirmação do pedido para o cliente"
    },
    {
        key: "sendCustomerReviews",
        icon: "bi-star-fill",
        action: "SEND_CUSTOMER_REVIEWS",
        label: "Enviar Avaliação",
        color: "text-yellow-500 hover:bg-yellow-50",
        tooltip: "Enviar pedido de avaliação da loja no Google Maps"
    },
    {
        key: "stockWithdrawal",
        icon: "bi-box-arrow-right",
        action: "STOCK_WITHDRAWAL",
        label: "Lançar Saída",
        color: "text-orange-600 hover:bg-orange-50",
        tooltip: "Lançar saída de estoque manualmente para este pedido"
    },
    {
        key: "stockReversal",
        icon: "bi-arrow-counterclockwise",
        action: "STOCK_REVERSAL",
        label: "Estornar Saída",
        color: "text-blue-600 hover:bg-blue-50",
        tooltip: "Estornar (devolver) itens para o estoque"
    }
];
