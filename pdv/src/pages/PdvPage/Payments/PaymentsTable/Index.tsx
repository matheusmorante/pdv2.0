import React, { useState } from "react";
import Body from "./Body";
import Footer from "./Footer";
import { PaymentsSummary, PaymentsData } from "../../../types/payments.type";

type Props = {
    paymentsData: PaymentsData,
    setPaymentsData: React.Dispatch<React.SetStateAction<PaymentsData>>,
    summary: PaymentsSummary
}

const PaymentsTable = ({ paymentsData, setPaymentsData, summary}: Props) => {

    const addPayment = () => {
        setPaymentsData( (prev:PaymentsData) => {
            return {
                ...prev, list:  
                [...prev.list, { method: 'Verificar', amount: 0, status: '' }]
            }
        })
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
            <Body paymentsData={paymentsData} setPaymentsData={setPaymentsData} />
            <Footer
                summary={summary}
            />

        </table>
    )
}
export default PaymentsTable;