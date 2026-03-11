import CurrencyDisplay from "../../../components/CurrencyDisplay";
import { PaymentsSummary } from "../../types/payments.type";

interface Props {
    summary: PaymentsSummary,
}

const TFoot = ({ summary }: Props) => {
    return (
        <tfoot>
            <tr>
                <th>Valor Total de Taxa</th>
                <th>V. T. do Pedido</th>
            </tr>
            <tr>
                <td>
                    <CurrencyDisplay value={summary.totalPaymentsFee} />
                </td>
                <td>
                    <CurrencyDisplay value={summary.totalOrderValue} />
                </td>
            </tr>
        </tfoot>
    )
}
export default TFoot;