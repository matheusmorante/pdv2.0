import ItemsTable from "./ItemsTable/Index";
import { useState } from "react";
import PaymentsTable from "./Payments/PaymentsTable/Index";
import PersonalInfos from "./CustomerData";
import useShipping from "./hooks/useShipping";
import OrderActions from "./OrderActions";
import useItems from "./hooks/useItems";
import usePaymentsData from "./hooks/usePaymentsData";
import { useCustomerData } from "./hooks/useCustomerData";
import { calcItemsSummary } from "./pdvUtils"; 
import { calcPaymentSummary } from "../utils"; 
import ShippingInputs from "./ShippingData";

const PdvPage = () => {
    const { items, setItems } = useItems();
    const { shipping, setShipping } = useShipping();
    const itemsSummary = calcItemsSummary(items);
    const { paymentsData, setPaymentsData } = usePaymentsData();
    const paymentsSummary = calcPaymentSummary(paymentsData, itemsSummary, shipping.value)
    const { customerData, setCustomerData } = useCustomerData();
    const [observation, setObservation] = useState('');
    const [seller, setSeller] = useState('');

    return (
        <form className="
            flex flex-col w-[900px] mx-auto p-4 shadow-md gap-6
            [&_input]:border-1 [&_input]:border-1 [&_input]:outline-blue-300 [&_input]:bg-white [&_input]:rounded-md [&_input]:p-0.5 [&_input]:px-2 [&_select]:rounded-md[&_select]:p-0.5 border-separate border-spacing-16 [&_th]:bg-gray-300
        ">
            <ItemsTable
                items={items}
                setItems={setItems}
                summary={itemsSummary}
            />

            <ShippingInputs
                shipping={shipping}
                setShipping={setShipping}
            />

            <input
                className="text-right pr-2"
                value={seller}
                onChange={
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                        setSeller(e.target.value)
                }
            />

            <PaymentsTable
                paymentsData={paymentsData}
                setPaymentsData={setPaymentsData}
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
                paymentsData,
                paymentsSummary,
                shipping,
                seller,
                customerData,
                observation
            }} />

        </form>
    )
}
export default PdvPage;