import { useEffect, useState } from "react";
import CustomerDataInputs from "./CustomerDataInputs";
import Header from "./Header";
import ItemsTable from "./itemsTable/Index";
import Order from "../types/order.type";
import PaymentsTable from "./PaymentsTable/Index";

const PrintableReceipt = () => {
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const storedOrder = sessionStorage.getItem('order');
        if (storedOrder) {
            setOrder(JSON.parse(storedOrder));
        }
    }, []);

    if (!order) return <p>Carregando...</p>;

    return (
        <>
            <Header />
            <CustomerDataInputs customerData={order.customerData} />
            <ItemsTable items={order.items} summary={order.itemsSummary} />
            <PaymentsTable
                paymentsData={order.paymentsData}
                summary={order.paymentsSummary}
             />


        </>

    )
};

export default PrintableReceipt;