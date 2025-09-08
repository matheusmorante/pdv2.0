import React from "react";
import { itemTotalValue } from "./utils";
import { currencyToNumber, percentToValue, valueToPercent } from "../utils";
import { NumericFormat } from 'react-number-format';
import { Item } from "../types/item.type";
import PercentModeBtn from "../PercentModeBtn";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const body = ({ items, setItems }: Props) => {
    const changeItems = (
        idx: number,
        key: keyof Item,
        value: string | boolean | number
    ) => {
        setItems((prev: Item[]) => {
            let newItems = [...prev];
            let item = { ...newItems[idx], [key]: value };

            if (key === 'discountIsPercentage') {
                const discountIsPercentage = value as boolean;

                item.discount =
                    discountIsPercentage
                        ? valueToPercent(item.price, item.discount)
                        : percentToValue(item.price, item.discount)
            }

            newItems[idx] = item;
            newItems[idx]['itemTotalValue'] = itemTotalValue(item);

            return newItems;
        })
    }

    return (
            <tbody>
                {
                    items.map((item, idx) => (
                        <tr>
                            <td className=" ">
                                <input
                                    className="w-full"
                                    value={item.description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        changeItems(idx, 'description', e.target.value)}
                                />
                            </td>
                            <td>
                                <NumericFormat
                                    className="w-full text-right"
                                    value={item.quantity}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={0}
                                    suffix=" un"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        changeItems(idx, 'quantity', e.target.value)}
                                />
                            </td>
                            <td>
                                <NumericFormat
                                    className="w-full text-right"
                                    value={item.price}
                                    thousandSeparator="."
                                    prefix={"R$ "}
                                    decimalScale={2}
                                    decimalSeparator=","
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        changeItems(
                                            idx,
                                            'price',
                                            currencyToNumber(e.target.value)
                                        )}
                                />
                            </td>
                            <td>
                                <div className="flex">
                                    <NumericFormat
                                        className="w-full text-right
                                         !rounded-r-none "
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix={item.discountIsPercentage ? '' : "R$ "}
                                        decimalScale={2}
                                        value={item.discount}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            changeItems(
                                                idx,
                                                'discount',
                                                currencyToNumber(e.target.value)
                                            )
                                        }
                                    />
                                    <PercentModeBtn
                                        action={
                                            () => changeItems(
                                                idx,
                                                'discountIsPercentage',
                                                !item.discountIsPercentage
                                            )
                                        }
                                    >
                                        {item.discountIsPercentage ? '%' : 'R$'}
                                    </PercentModeBtn>
                                </div>
                            </td>
                            <td>
                                <NumericFormat
                                    className="w-full text-right"
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix={"R$ "}
                                    decimalScale={2}
                                    value={item.itemTotalValue}
                                />
                            </td>
                        </tr>
                    ))}
            </ tbody>
        )
};


export default body;
