import { ItemsSummary, Item } from "./items.type";
import CustomerData from "./customerData.type";
import { PaymentsData, PaymentsSummary } from "./payments.type";
import Shipping from "./Shipping.type";

type Order = {
    items: Item[],
    itemsSummary: ItemsSummary,
    shipping: Shipping,
    seller: String,
    paymentsData: PaymentsData,
    paymentsSummary: PaymentsSummary
    customerData: CustomerData,
    observation: string
}

export default Order;
