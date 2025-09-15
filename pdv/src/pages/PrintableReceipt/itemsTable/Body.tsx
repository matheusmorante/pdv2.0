import React from "react";
import Item from "../../types/items.type";
import { NumericFormat } from "react-number-format";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const Body = ({ items }: Props) => {
    return (
        <tbody>
            {
                items.map((item, idx) => (
                    <tr key={idx}>
                        <td className=" ">
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
                                value={item.fixedDiscount}
                                thousandSeparator="."
                                prefix="R$ "
                                decimalScale={2}
                                decimalSeparator=","
                                className="w-full text-right pr-2"
                            />
                        </td>
                        <td>
                            <NumericFormat
                                value={item.itemTotalValue}
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
