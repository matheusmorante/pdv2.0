import { NumericFormat } from 'react-number-format';
import { PaymentsSummary } from "../../../types/payments.type";

interface Props {
    summary: PaymentsSummary,

}

const Footer = ({ summary }: Props) => {

    return (
        <tfoot>
            <tr>
                <td>Valor Total do Pedido</td>
                <td>Valor Total Pago</td>
                <td>Valor Restante</td>

            </tr>
            <tr>
                <td>
                    <NumericFormat
                        value={summary.totalOrderValue}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={true}
                    />
                </td>
                <td>
                    <NumericFormat
                        value={summary.totalAmountPaid}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={true}
                    />
                </td>
                <td>
                    <NumericFormat
                        value={summary.amountRemaining}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={true}
                    />
                </td>

            </tr>
        </tfoot>
    )
}
export default Footer;