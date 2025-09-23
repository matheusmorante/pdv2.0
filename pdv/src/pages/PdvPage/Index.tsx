import ItemsTable from "./ItemsTable/Index";
import { useState } from "react";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import useShipping from "./hooks/useShipping";
import OrderActions from "./OrderActions";
import useItems from "./hooks/useItems";
import usePaymentsData from "./hooks/usePayments";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcItemsSummary } from "./pdvUtils";
import { calcPaymentsSummary } from "../utils/calculations";
import ShippingInputs from "./ShippingData";
import Seller from "./Seller";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PdvPage = () => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping();
    const itemsSummary = calcItemsSummary(items);
    const { payments, setPayments } = usePaymentsData();
    const paymentsSummary = calcPaymentsSummary(
        payments, itemsSummary, shipping.value
    );
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState('');
    const [seller, setSeller] = useState('');

    return (
        <form
            className="
                flex flex-col w-[900px] mx-auto p-4 shadow-lg shadow-slate-400 
                gap-6 [&_th]:border-2 [&_td]:border-2 [&_input]:bg-white [&_td]:px-1
                [&_td]:border-gray-200 [&_th]:bg-gray-300 [&_th]:py-1
                [&_td]:py-1 [&_input]:px-2 focus:[&_input]:outline-none
                mt-2 
            "
        >
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                draggable
            />

            <ItemsTable
                items={items}
                setItems={setItems}
                summary={itemsSummary}
            />

            <div className="flex">
                <Seller seller={seller} setSeller={setSeller} />

                <ShippingInputs
                    shipping={shipping}
                    setShipping={setShipping}
                />
            </div>

            <PaymentsTable
                payments={payments}
                setPayments={setPayments}
                summary={paymentsSummary}
            />

            <PersonalInfos
                customerData={customerData}
                setCustomerData={setCustomerData}
            />

            <div>
                <label>Observações</label>
                <input
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    className="w-full min-h-[100px] border border-red-700"
                />
            </div>

            <OrderActions order={{
                items,
                itemsSummary,
                payments,
                paymentsSummary,
                shipping,
                seller,
                customerData,
                observation,
                date: ''
            }} />

        </form>
    )
}
export default PdvPage;