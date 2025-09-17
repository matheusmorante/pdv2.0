import Body from "./Body";
import Footer from "./Footer";
import {PaymentsData, PaymentsSummary} from "../../types/payments.type";

type Props = {
    paymentsData: PaymentsData,
    summary: PaymentsSummary
}

const PaymentsTable = ({ paymentsData, summary }: Props) => {

    return (
        <table className="break-words w-full [&_td]:border-2 [&_th]:border-2">
            <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[15%]" />
                    <col className="w-[50%]" />
                </colgroup>
            <thead>

                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                </tr>
            </thead>
            <Body payments={paymentsData.list}  />
            <Footer summary={summary}/>
        </table>
    )
}
export default PaymentsTable;