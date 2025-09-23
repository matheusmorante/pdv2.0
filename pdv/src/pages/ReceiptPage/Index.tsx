import CustomerData from "./CustomerData";
import Header from "./Header";
import ItemsTable from "./itemsTable/Index";
import PaymentsTable from "./PaymentsTable/Index";
import ShippingData from "./ShippingData";

const ReceiptPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    return (
        <div className="flex flex-col gap-2 [&_th]:bg-gray-400 [&_td]:bg-white
         [&_input]:px-2 [&_input]:bg-white">
            <Header />
            <div><strong>Vendedor:</strong> {order.seller}</div>
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />
            <div className="flex flex-row justify-around gap-6">
                {
                    order.shipping.scheduling.time &&
                    <ShippingData shipping={order.shipping} />
                }
                <PaymentsTable
                    payments={order.payments}
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