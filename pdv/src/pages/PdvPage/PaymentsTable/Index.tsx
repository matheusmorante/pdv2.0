import React from "react";
import Body from "./Body";
import Footer from "./Footer";
import { PaymentsSummary, Payment } from "../../types/payments.type";

type Props = {
    payments: Payment[],
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>,
    summary: PaymentsSummary
}

const PaymentsTable = ({ payments, setPayments, summary }: Props) => {

    const addPayment = () => {
        setPayments((prev: Payment[]) => {
            return [...prev, {
                method: 'Verificar',
                amount: 0,
                fee: 0,
                feeType: 'fixed',
                status: ''
            }]
        })
    }

    return (
        <table className="w-[full]">
            <colgroup>
                <col className="w-[30%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[35%]" />
                <col className="w-[5%] [&_td]:bg-white [&_td]:border-white" />
            </colgroup>
            <thead>
                <tr>
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Taxa</th>
                    <th>Total a Pagar</th>
                    <th>Status</th>
                    <th className='border-none !bg-white'>
                        <i onClick={addPayment} className="bi bi-plus-lg" />
                    </th>
                </tr>
            </thead>
            <Body payments={payments} setPayments={setPayments} />
            <Footer
                summary={summary}
            />
        </table>
    )
}
export default PaymentsTable;