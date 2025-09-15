import React from "react";
import BodyRow from "./BodyRow";
import Item from "../../types/items.type";

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
            const newItems = [...prev];
            const newItem = { ...newItems[idx], [key]: value };

            if (key === 'fixedDiscount' || key === 'unitPrice' || key === 'quantity') {
                newItem.percentDiscount = newItem.fixedDiscount / newItem.unitPrice * 100;
            }

            if (key === 'percentDiscount' || key === 'unitPrice' || key === 'quantity') {
                newItem.fixedDiscount = newItem.unitPrice * newItem.percentDiscount / 100
            }

            newItems[idx] = newItem;
            return newItems
        });
    };

    const deleteItem = (idx: number) => {
        setItems((prev: Item[]) => [...prev].filter((_, filterIdx) =>
            filterIdx !== idx
        ))
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
