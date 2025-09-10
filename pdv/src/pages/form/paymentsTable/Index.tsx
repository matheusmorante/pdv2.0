import React, { useState } from "react";
import TBody from "./TBody";
import TFoot from "./TFoot";
import { Payment } from "../types/Payment.type";
import { Summary } from "../types/summary.type";
import AdditionalInformation from "../types/additionalInformation.type";

type Props = {
    payments: Payment[],
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>,
    summary: Summary,
    additionalInformation: AdditionalInformation
}

const PaymentsTable = ({ payments, setPayments, summary, additionalInformation }: Props) => {

    const addPayment = () => {
        setPayments(prev => [...prev, { method: 'Verificar', amount: 0, status: '' }])
    }

    return (
        <table className="w-[40%] mx-autohj">
            <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                   
                </colgroup>
            <thead>

                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th><i onClick={addPayment} className="bi bi-plus-lg" /></th>
                </tr>
            </thead>
            <TBody payments={payments} setPayments={setPayments} />
            <TFoot
                payments={payments}
                summary={summary}
                additionalInformation={additionalInformation}
            />

        </table>
    )
}
export default PaymentsTable;