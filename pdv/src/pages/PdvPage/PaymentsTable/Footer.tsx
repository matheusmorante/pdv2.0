import { PaymentsSummary } from "../../types/payments.type";
import CurrencyDisplay from '../../../components/CurrencyDisplay';

interface Props {
    summary: PaymentsSummary,
}

const Footer = ({ summary }: Props) => {

    return (
        <tfoot>
            <tr>
                <th>Valor Total de Taxa</th>
                <th>V. T. do Pedido</th>
                <th>Valor Total Pago</th>
                <th>Valor Restante</th>
            </tr>
            <tr>
                <td>
                    <CurrencyDisplay value={summary.totalPaymentsFee}/>
                </td>
                <td>
                    <CurrencyDisplay value={summary.totalOrderValue}/>
                </td>
                <td>
                    <CurrencyDisplay value={summary.totalAmountPaid}/>
                </td>
                <td>
                    <CurrencyDisplay value={summary.amountRemaining}/>
                </td>

            </tr>
        </tfoot>
    )
}
export default Footer;