import React from "react";
import BodyRow from "./BodyRow";
import Item from "../types/item.type";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const Body = ({ items, setItems }: Props) => {
    const changeItems = (
        idx: number,
        key: keyof Item,
        value: string | number
    ) => {
        setItems((prev: Item[]) => {
            let newItems = [...prev];
            let item = { ...newItems[idx], [key]: value };

            if (key === 'fixedDiscount' || key === 'unitPrice' || key === 'quantity') {
                item.percentDiscount = item.fixedDiscount / item.unitPrice * 100;
            }

            if (key === 'percentDiscount' || key === 'unitPrice' || key === 'quantity') {
                item.fixedDiscount = item.unitPrice * item.percentDiscount / 100
            }

            item.itemTotalValue = (item.unitPrice - item.fixedDiscount) * item.quantity;
            newItems[idx] = item;
            return newItems;
        });
    };

    const deleteItem = (idx: number) => {
        setItems((prev: Item[]) => prev.filter((_, filterIdx) => {
            return filterIdx !== idx
        }))
    }

    return (
        <tbody>
            {
                items.map((item, mapIdx) => (
                    <BodyRow
                        item={item}
                        idx={mapIdx}
                        onChange={changeItems}
                        onDelete={() => deleteItem(mapIdx)}
                    />
                ))
            }
        </ tbody>
    )
};


export default Body;
