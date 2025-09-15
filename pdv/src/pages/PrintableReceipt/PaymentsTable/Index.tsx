import Body from "./Body";
import Footer from "./Footer";
import {PaymentsData, PaymentsSummary} from "../../types/payments.type";

type Props = {
    paymentsData: PaymentsData,
    summary: PaymentsSummary
}

const PaymentsTable = ({ paymentsData, summary }: Props) => {

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
                </tr>
            </thead>
            <Body payments={paymentsData.list}  />
            <Footer summary={summary}/>
        </table>
    )
}
export default PaymentsTable;