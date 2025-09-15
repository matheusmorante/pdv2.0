import { NumericFormat } from 'react-number-format';
import { ItemsSummary } from "../../types/items.type";

interface Props {
    summary: ItemsSummary,
}

const Footer = ({ summary }: Props) => {

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
                        className="text-right w-full"
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
                        className="text-right w-full"
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
                        className="text-right w-full"
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
                        className="text-right w-full"
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