import React from "react";
import BodyRow from "./BodyRow";
import Item from "../../types/items.type";

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
                newItem.discount = newItem.discount / newItem.unitPrice * 100;
                newItem.discountType = "percentage"
            } else {
                newItem.discount = newItem.unitPrice * newItem.discount / 100;
                newItem.discountType = "fixed"
            }
            newItems[idx] = newItem;
            return newItems
        });
    }
    const changeItems = (
        idx: number,
        key: keyof Item,
        value: string | number
    ) => {
        setItems((prev: Item[]) => {
            const newItems = [...prev ];
            const newItem = { ...newItems[idx], [key]: value };

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
                        toggleDiscountType={toggleDiscountType}
                        onDelete={() => deleteItem(mapIdx)}
                    />
                ))
            }
        </ tbody>
    )
};


export default Body;
