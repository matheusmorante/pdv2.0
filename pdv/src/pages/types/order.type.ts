import { ItemsSummary, Item } from "./items.type";
import CustomerData from "./customerData.type";
import { Payment, PaymentsSummary } from "./payments.type";
import Shipping from "./Shipping.type";

export type Order = {
    id?: string,
    status?: string,
    items: Item[],
    itemsSummary: ItemsSummary,
    shipping: Shipping,
    seller: String,
    payments: Payment[],
    paymentsSummary: PaymentsSummary
    customerData: CustomerData,
    observation: string,
    date: string,
    deleted?: boolean,
    deletedAt?: string,
    orderIndex?: number,
    reviewRequested?: boolean
}

export type OrderAction =
    'PRINT_RECEIPT' |
    'PRINT_SHIPPING_ORDER' |
    'PRINT_WARRANTY_TERM' |
    'SEND_SHIPPING_ORDER' |
    'SEND_CUSTOMER_ORDER' |
    'SEND_CUSTOMER_REVIEWS'

/** @deprecated Use OrderAction instead */
export type PdvAction = OrderAction;

export type IsButtonsClicked = {
    printReceipt: boolean,
    printShippingOrder: boolean,
    printWarrantyTerm: boolean,
    sendShippingOrder: boolean,
    sendCustomerOrder: boolean,
    sendCustomerReviews: boolean
}

export type VisibilitySettings = {
    id: boolean;
    orderDate: boolean;
    deliveryDate: boolean;
    customer: boolean;
    totalValue: boolean;
    status: boolean;
    modality: boolean;
    manuseio: boolean;
    actions: boolean;
};

export default Order;
