import { PaymentsSummary } from "../../types/payments.type";
import { NumericFormat } from 'react-number-format';

interface Props {
    summary: PaymentsSummary,
}

const TFoot = ({ summary }: Props) => {
    return (
        <tfoot>
            <tr>
                <td>Valor do Pedido</td>
            </tr>
            <tr>
                <td>
                    <NumericFormat
                        value={summary.totalOrderValue}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={false}
                    />
                </td>
            </tr>
        </tfoot>
    )
}
export default TFoot;