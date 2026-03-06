import React from "react";
import Body from "./Body";
import Footer from "./Footer";
import { PaymentsSummary, Payment } from "../../../types/payments.type";

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
            <thead className="bg-slate-50/50">
                <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Forma de Pagamento</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Taxa</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Total a Pagar</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-4 py-3 text-center border-none bg-transparent">
                        <button
                            type="button"
                            onClick={addPayment}
                            className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                            title="Adicionar Pagamento"
                        >
                            <i className="bi bi-plus-lg" />
                        </button>
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