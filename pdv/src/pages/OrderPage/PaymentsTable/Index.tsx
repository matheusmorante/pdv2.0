import Body from "./Body";
import Footer from "./Footer";
import {Payment, PaymentsSummary} from "../../types/payments.type";

type Props = {
    payments: Payment[],
    summary: PaymentsSummary
}

const PaymentsTable = ({ payments, summary }: Props) => {

    return (
        <table className="break-words w-[70%] [&_td]:border-2 [&_th]:border-2
            [&_th]:font-bold [&_th]:text-center">
            <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[25%]" />
                    <col className="w-[35%]" />
                </colgroup>
            <thead>

                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                </tr>
            </thead>
            <Body payments={payments}  />
            <Footer summary={summary}/>
        </table>
    )
}
export default PaymentsTable;