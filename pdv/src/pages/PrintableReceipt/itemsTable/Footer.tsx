
import { NumericFormat } from 'react-number-format';
import Summary from "../../types/itemsSummary.type";

interface Props {
    summary: Summary,
}

const Footer = ({summary} : Props ) => {

    return (
        <tfoot>
            <tr>
                <th></th>
                <th>Qt. total</th>
                <th>Subtotal</th>
                <th>Desc. Total</th>
                <th>Valor Total</th>
            </tr>
            <tr className="break-words [&_input]:bg-gray-300">
                <td className="border-none"></td>
                <td>
                    <NumericFormat
                        className="text-right w-full pr-2"
                        value={summary.totalQuantity}
                        decimalScale={0}
                        thousandSeparator="."
                        decimalSeparator=","
                        suffix=" un"
                        disabled={true}
                    />
                </td>
                <td>
                    <NumericFormat
                        className="text-right w-full pr-2"
                        value={summary.itemsSubtotal}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={true}
                    />
                </td>
                <td>
                    <NumericFormat
                        className="text-right w-full pr-2"
                        value={summary.totalDiscount}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={6}
                        decimalSeparator=","
                        disabled={true}
                    />
                </td>
                <td>
                    <NumericFormat
                        className="text-right w-full pr-2"
                        value={summary.itemsTotalValue}
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