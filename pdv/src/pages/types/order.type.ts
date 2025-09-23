import { ItemsSummary, Item } from "./items.type";
import CustomerData from "./customerData.type";
import { Payment, PaymentsSummary } from "./payments.type";
import Shipping from "./Shipping.type";

type Order = {
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

export default Order;
