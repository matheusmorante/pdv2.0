import Order, { PdvAction } from "../../types/pdvAction.type";
import {
    customerOrderWhatsappUrl,
    shippingOrderWhatsappUrl,
    customerReviewsWhatsappUrl
} from "../../utils/whatsapp";

export const actionsMap: Record<PdvAction, (order: Order) => void> = {
    PRINT_RECEIPT: () => window.open("/receipt", "_blank"),
    PRINT_SHIPPING_ORDER: () => window.open("/order", "_blank"),
    PRINT_WARRANTY_TERM: () => window.open("/warranty-term", "_blank"),
    SEND_SHIPPING_ORDER: (o) => shippingOrderWhatsappUrl(o),
    SEND_CUSTOMER_ORDER: (o) => customerOrderWhatsappUrl(o),
    SEND_CUSTOMER_REVIEWS: (o) => customerReviewsWhatsappUrl(o),
}

export const buttons = [
    {
        label: "Imprimir Recibo",
        color: "bg-gray-400",
        key: "printReceipt",
        action: "PRINT_RECEIPT"
    },
    {
        label: "Imprimir Pedido",
        color: "bg-blue-500",
        key: "printShippingOrder",
        action: "PRINT_SHIPPING_ORDER"
    },
    {
        label: "Imprimir Garantia",
        color: "bg-yellow-500",
        key: "printWarrantyTerm",
        action: "PRINT_WARRANTY_TERM"
    },
    {
        label: "Enviar Pedido de Entrega",
        color: "bg-green-500",
        key: "sendShippingOrder",
        action: "SEND_SHIPPING_ORDER"
    },
    {
        label: "Enviar Pedido do Cliente",
        color: "bg-red-500",
        key: "sendCustomerOrder",
        action: "SEND_CUSTOMER_ORDER"
    },
    {
        label: "Enviar Avaliação",
        color: "bg-orange-500",
        key: "sendCustomerReviews",
        action: "SEND_CUSTOMER_REVIEWS"
    },
] as const;
