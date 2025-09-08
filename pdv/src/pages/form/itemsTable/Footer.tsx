import { useEffect } from "react";
import { Item } from "../types/item.type";
import { NumericFormat } from 'react-number-format';
import { sumKeyValues } from "./utils";
import { Summary } from "../types/summary.type";

interface Props {
    items: Item[],
    summary: Summary,
    setSummary: React.Dispatch<React.SetStateAction<Summary>>
}

const Footer = (
    { items, summary, setSummary}: Props
) => {

    useEffect(() => {
        const totalQuantity = sumKeyValues(items, 'quantity');
        const totalDiscount = sumKeyValues(items, 'discount');
        const itemsTotalValue = sumKeyValues(items, 'itemTotalValue');
        const itemsSubtotal = itemsTotalValue - totalDiscount;

        setSummary((prev) => {
            const newSummary = {...prev};
            newSummary.totalDiscount = totalDiscount;
            newSummary.totalQuantity = totalQuantity;
            newSummary.itemsTotalValue = itemsTotalValue;
            newSummary.itemsSubtotal = itemsSubtotal;
            return newSummary;
        })
    }, [items])


    return (
        <tfoot>
            <tr>
                <th></th>
                <th>Quant. total</th>
                <th>Subtotal</th>
                <th>Desc. Total</th>
                <th>Valor Total</th>
            </tr>
            <tr className="break-words">
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
                        decimalScale={2}
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