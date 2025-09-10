import ItemsTable from "./ItemsTable/Index";
import React, { useState } from "react";
import PaymentsTable from "./PaymentsTable/Index";
import PersonalInfos from "./CustomerInfo";
import Item from './types/item.type';
import { Payment } from "./types/Payment.type";
import { Summary } from "./types/summary.type";
import AdditionalInformation from "./types/additionalInformation.type";
import AdditionalInformationInput from "./AdditionalInformationInputs";

const Form = () => {
    const [items, setItems] = useState<Item[]>([
        {
            description: '',
            quantity: 1,
            unitPrice: 0,
            fixedDiscount: 0,
            percentDiscount: 0,
            itemTotalValue: 0
        }
    ]);

    const [summary, setSummary] = useState<Summary>({
        totalQuantity: 0,
        itemsSubtotal: 0,
        totalDiscount: 0,
        itemsTotalValue: 0
    });

    const [additionalInformation, setAdditionalInformation] =
        useState<AdditionalInformation>(
            {
                freight: 0,
                fee: 0,
                deliveryScheduling: {
                    date: new Date(),
                    time: ""
                },
                seller: "",
            }
        )
    const [payments, setPayments] = useState<Payment[]>([{
        method: 'Verificar',
        amount: 0,
        status: ''
    }])

    return (
        <form className="
            flex flex-col w-[900px] mx-auto p-4 shadow-md gap-6
            [&_input]:border-1 [&_input]:border-1 [&_input]:outline-blue-300 [&_input]:bg-white [&_input]:rounded-md [&_input]:p-0.5 [&_input]:px-2 [&_select]:rounded-md[&_select]:p-0.5 border-separate border-spacing-16 [&_th]:bg-gray-300
        ">
            <ItemsTable
                items={items}
                setItems={setItems}
                summary={summary}
                setSummary={setSummary}
            />

            <AdditionalInformationInput
                additionalInformation={additionalInformation}
                setAdditionalInformation={setAdditionalInformation}
            />

            <PaymentsTable
                payments={payments}
                setPayments={setPayments}
                summary={summary}
                additionalInformation={additionalInformation}
            />

            <PersonalInfos />
            <div>
                <label>Observações</label>
                <input className="w-full min-h-[100px] border border-red-700" />
            </div>
        </form>
    )
}
export default Form;