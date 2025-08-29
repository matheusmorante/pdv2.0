import React from "react";
import {currencyToNumber, itemTotalValue, toggleDiscountMode } from "../../../utils/form";
import { NumericFormat } from 'react-number-format';
import { Item } from "../Index";
import PercentModeBtn from "../PercentModeBtn";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const TFoot = ({ items, setItems }: Props) => {
    const changeItems = (
        idx: number,
        key: keyof Item,
        value: string | boolean | number
    ) => {
        setItems((prev: Item[]) => {
            const newItems = [...prev];
            const price = newItems[idx]['price'];
            const quantity = newItems[idx]['quantity'];
            const discount = newItems[idx]['discount'];
            const discountIsPercentage = newItems[idx]['discountIsPercentage'];

            newItems[idx] = { ...newItems[idx], [key]: value };

            if (key === 'discountIsPercentage') {
                const newDiscountIsPercentage = value as boolean;
                const newDiscount = toggleDiscountMode(price, discount, newDiscountIsPercentage);
                newItems[idx]['discount'] = newDiscount;
            }

            newItems[idx]['itemTotalValue'] = itemTotalValue(
                price,
                quantity,
                discount,
                discountIsPercentage
            );

            return newItems;
        });
    }

    return (
        <tbody>
            {
                items.map((item, idx) => (
                    <tr>
                        <td>
                            <input
                                value={item.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    changeItems(idx, 'description', e.target.value)}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    changeItems(idx, 'quantity', e.target.value)}
                            />
                        </td>
                        <td>
                            <NumericFormat
                                value={item.price}
                                allowNegative={false}
                                thousandSeparator="."
                                prefix={"R$ "}
                                decimalScale={2}
                                decimalSeparator=","
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    changeItems(idx, 'price', currencyToNumber(e.target.value))}
                            />
                        </td>
                        <td>
                            <NumericFormat
                                allowNegative={false}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={item.discountIsPercentage ? '' : "R$ "}
                                decimalScale={2}
                                value={item.discount}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    changeItems(idx, 'discount', currencyToNumber(e.target.value))}
                            />
                            <PercentModeBtn action={() => changeItems(idx, 'discountIsPercentage', !item.discountIsPercentage)}>
                                {item.discountIsPercentage ? '%' : 'R$'}
                            </PercentModeBtn>
                        </td>
                        <td>{item.itemTotalValue}</td>
                    </tr>
                ))}
        </ tbody>
    )
}


export default TFoot;
