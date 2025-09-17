
import Item from "../../types/items.type";
import { NumericFormat } from "react-number-format";
import { calcItemTotalValue, getFixedDiscount } from "../../utils";

interface Props {
    items: Item[];
}

const Body = ({ items }: Props) => {
    return (
        <tbody>
            {
                items.map((item, idx) => (
                    <tr key={idx}>
                        <td className="pl-2">
                            {item.description}
                        </td>
                        <td>
                            <NumericFormat
                                className="w-full text-right pr-2"
                                value={item.quantity}

                                decimalSeparator=""
                                suffix=" un"
                            />
                        </td>
                        <td>
                            <NumericFormat
                                value={item.unitPrice}
                                thousandSeparator="."
                                prefix="R$ "
                                decimalScale={2}
                                decimalSeparator=","
                                className="w-full text-right pr-2"
                            />
                        </td>
                        <td>
                            <NumericFormat
                                value={getFixedDiscount(item)}
                                thousandSeparator="."
                                prefix={"R$ "}
                                decimalScale={2}
                                decimalSeparator=","
                                className="w-full text-right pr-2"
                            />
                        </td>
                        <td>
                            <NumericFormat
                                value={calcItemTotalValue(item)}
                                thousandSeparator="."
                                prefix="R$ "
                                decimalScale={2}
                                decimalSeparator=","
                                className="w-full text-right pr-2"
                            />
                        </td>
                    </tr>
                ))
            }
        </ tbody>
    )
};

export default Body;
