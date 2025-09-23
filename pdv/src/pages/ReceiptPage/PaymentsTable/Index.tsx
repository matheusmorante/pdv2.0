import Body from "./Body";
import Footer from "./Footer";
import { useEffect } from "react";
import { Payment, PaymentsSummary } from "../../types/payments.type";

type Props = {
    payments: Payment[],
    summary: PaymentsSummary
}

const PaymentsTable = ({ payments, summary }: Props) => {

    useEffect(() => {
        window.print();
    }, []);

    return (
        <table className=" w-[60%] break-words [&_td]:border-2 [&_th]:border-2">
            <colgroup>
                <col className="w-[40%]" />
                <col className="w-[30%]" />
            </colgroup>
            <thead>
                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <Body payments={payments} />
            <Footer summary={summary} />
        </table>
    )
}
export default PaymentsTable;