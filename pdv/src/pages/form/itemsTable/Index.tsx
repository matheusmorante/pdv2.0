import React from "react";
import TFooter from "./TFooter";
import TBody from "./TBody";
import { Item } from "../Index";

interface Props {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    freight: number;
    setFreight: React.Dispatch<React.SetStateAction<number>>;
    orderTotalValue: number;
    setOrderTotalValue: React.Dispatch<React.SetStateAction<number>>;
}

const Table = ({ items, setItems, freight, setFreight, orderTotalValue, setOrderTotalValue }: Props) => {
    const addItem = () => {
        setItems(prev => [...prev, { description: '', quantity: 1, price: 0, discount: 0, discountIsPercentage: false, itemTotalValue: 0 }])
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Descrição do Produto</th>
                    <th>Quantidade</th>
                    <th>Preço Unitário</th>
                    <th>Desconto Unitário</th>
                    <th>Valor Total</th>
                    <th><i onClick={addItem} className="bi bi-plus-lg" /></th>
                </tr>
            </thead>

            <TBody items={items} setItems={setItems} />
            <TFooter 
                items={items}
                freight={freight}
                setFreight={setFreight}
                orderTotalValue={orderTotalValue}
                setOrderTotalValue={setOrderTotalValue}
            />
        </table >

    )
}
export default Table;