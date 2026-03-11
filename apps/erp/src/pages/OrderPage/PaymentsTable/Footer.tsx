import { PaymentsSummary } from "../../types/payments.type";
import CurrencyDisplay from "../../../components/CurrencyDisplay";

interface Props {
    summary: PaymentsSummary,
}

const TFoot = ({ summary }: Props) => {
    return (
         <tfoot>
            <tr>
                <th>Valor Total de Juros</th>
                <th>Valor do Pedido</th>
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