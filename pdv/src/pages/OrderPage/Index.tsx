import CustomerData from "./CustomerData";
import ItemsTable from "./itemsTable/Index";
import PaymentsTable from "./PaymentsTable/Index";
import ShippingData from "./ShippingData";
import { useEffect } from "react";

const OrderPage = () => {
    const storedOrder = sessionStorage.getItem('order');
    const order = storedOrder ? JSON.parse(storedOrder) : null;

       useEffect(() => {
        window.print();
    }, []);


    return (
        <div className="flex flex-col gap-4 [&_tr_th]:bg-gray-300 
            [&_input]:px-2 [&_input]:bg-white">
            <div className="flex justify-between">
                <div>Vendedor: {order.seller}</div>
                <div>Data de emissão: {order.date}</div>

            </div>
            <div>
                <h1 className="font-bold">OBSERVAÇÕES SOBRE A ENTREGA</h1>
                <div className="min-h-[100px] border-2 border-red-600">
                    {order.observation}
                </div>
            </div>
            <CustomerData customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />

            <div className="flex flex-row justify-around gap-6">
                <ShippingData shipping={order.shipping} />

                <PaymentsTable
                    payments={order.payments}
                    summary={order.paymentsSummary}
                />

            </div>
        </div>
    )
};

export default OrderPage;