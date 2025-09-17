import CustomerData from "./CustomerData";
import Header from "./Header";
import ItemsTable from "./itemsTable/Index";
import PaymentsTable from "./PaymentsTable/Index";
import ShippingData from "./ShippingData";
import Order from "../types/order.type";

const ReceiptPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    return (
        <div className="flex flex-col gap-8">
            <Header />
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />
            <div className="flex flex-row justify-around gap-4">
                {
                    order.shipping.scheduling.time &&
                    <ShippingData shipping={order.shipping} />
                }
                <PaymentsTable
                    paymentsData={order.paymentsData}
                    summary={order.paymentsSummary}
                />

            </div>

            <div className="flex text-center gap-10 justify-center mt-10">
                <div className="assinatura">
                    <div>________________________________________________</div>
                    <div>Assinatura do Vendedor</div>
                </div>
            </div>
        </div>
    )
};

export default ReceiptPage;