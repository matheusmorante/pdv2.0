import { useState } from "react";
import TBody from "./TBody";

export type Payment = {
    value: number;
    fee: number;
    feeIsPercentage: boolean;
    paymentTotalValue: number;
    status: string;
}
const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([{ value: 0, fee: 0, feeIsPercentage: false, paymentTotalValue: 0, status: '' }])

    

    const addPayment = () => {
        setPayments(prev => [...prev, { value: 0, fee: 0, feeIsPercentage: false, paymentTotalValue: 0, status: '' }])
    }


    return (
        <table>
            <thead>
                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Juros</th>
                    <th>Status</th>
                    <th><i onClick={addPayment} className="bi bi-plus-lg" /></th>
                </tr>
            </thead>
            <TBody payments={payments} setPayments={setPayments}/>
            
        </table>
    )
}
export default Payments;