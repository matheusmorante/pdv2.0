import React from "react";
import Footer from "./Footer";
import Body from "./Body";
import { Item } from "../types/item.type";
import { Summary } from "../types/summary.type";

interface Props {
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    summary: Summary;
    setSummary: React.Dispatch<React.SetStateAction<Summary>>
}

const Items = (
    { items, setItems, summary, setSummary }: Props
) => {
    const addItem = () => {
        setItems(prev => [...prev, { description: '', quantity: 1, price: 0, discount: 0, discountIsPercentage: false, itemTotalValue: 0 }]);
    }

    return (
        <>
            <table className="break-words w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[40%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[16%]" />
                    <col className="w-[14%]" />
                    <col className="w-[2%]" />
                </colgroup>

                <thead>
                    <tr>
                        <th className="">Descrição do Produto/Serviço</th>
                        <th>Quantidade</th>
                        <th>Preço Unitário</th>
                        <th>Desconto Unitário</th>
                        <th>Valor Total</th>
                        <th><i onClick={addItem} className="bi bi-plus-lg" /></th>
                    </tr>
                </thead>

                <Body items={items} setItems={setItems} />

                <Footer
                    items={items}
                    summary={summary}
                    setSummary={setSummary}
                />

            </table >

        </>

    )
}
export default Items;