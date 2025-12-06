import { ItemsSummary, Item } from "./items.type";
import CustomerData from "./customerData.type";
import { Payment, PaymentsSummary } from "./payments.type";
import Shipping from "./Shipping.type";

export type Order = {
    items: Item[],
    itemsSummary: ItemsSummary,
    shipping: Shipping,
    seller: String,
    payments: Payment[],
    paymentsSummary: PaymentsSummary
    customerData: CustomerData,
    observation: string
    date: string
}

export type PdvAction =
    'PRINT_RECEIPT' |
    'PRINT_SHIPPING_ORDER' |
    'PRINT_WARRANTY_TERM' |
    'SEND_SHIPPING_ORDER' |
    'SEND_CUSTOMER_ORDER' |
    'SEND_CUSTOMER_REVIEWS'

export type IsButtonsClicked = {
        printReceipt: boolean,
        printShippingOrder: boolean,
        printWarrantyTerm: boolean,
        sendShippingOrder: boolean,
        sendCustomerOrder: boolean,
        sendCustomerReviews: boolean
    }

export default Order;
