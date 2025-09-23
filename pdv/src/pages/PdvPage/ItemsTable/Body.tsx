import React from "react";
import BodyRow from "./BodyRow";
import Item from "../../types/items.type";
import { sanitizeItem } from "../../utils/sanitization";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const Body = ({ items, setItems }: Props) => {
    const toggleDiscountType = (idx: number) => {
        setItems((prev: Item[]) => {
            const newItems = [...prev];
            const newItem = { ...newItems[idx] };

            if (newItem.discountType === "fixed") {
                newItem.unitDiscount = newItem.unitDiscount / newItem.unitPrice * 100;
                newItem.discountType = "percentage"
            } else {
                newItem.unitDiscount = newItem.unitPrice * newItem.unitDiscount / 100;
                newItem.discountType = "fixed"
            }

            newItems[idx] = newItem;
            return newItems
        });
    }

    const changeItems = (
        idx: number, key: keyof Item, value: string | number
    ) => {
        setItems((prev: Item[]) => {
            const newItems = [...prev];
            const newItem = sanitizeItem({ ...newItems[idx], [key]: value });
            newItems[idx] = newItem;
            return newItems
        });
    };

    const deleteItem = (idx: number) => {
        setItems((prev: Item[]) => [...prev].filter((_, filterIdx) =>
            filterIdx !== idx
        ));
    };

    return (
        <tbody>
            {
                items.map((item, idx) => (
                    <BodyRow
                        item={item}
                        idx={idx}
                        onChange={changeItems}
                        onToggleDiscountType={() => toggleDiscountType(idx)}
                        onDelete={() => deleteItem(idx)}
                    />
                ))
            }
        </ tbody>
    )
};


export default Body;
