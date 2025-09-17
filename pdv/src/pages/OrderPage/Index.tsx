import CustomerData from "./CustomerData";
import ItemsTable from "./itemsTable/Index";
import PaymentsTable from "./PaymentsTable/Index";

const OrderPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

    return (
        <>
            <label>OBSERVAÇÕES SOBRE A ENTREGA</label>
            <div className="min-h-[100px] border-2 border-red-600">{order.observation}</div>
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />
            <PaymentsTable
                paymentsData={order.paymentsData}
                summary={order.paymentsSummary}
            />
        </>
    )
};

export default OrderPage;