import React, { useEffect } from "react";
import Footer from "./Footer";
import Body from "./Body";
import Item from "../types/item.type";
import { Summary } from "../types/summary.type";
import { sumKeyValues } from "../utils";


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
        setItems(prev => [...prev,
        {
            description: '',
            quantity: 1,
            unitPrice: 0,
            fixedDiscount: 0,
            percentDiscount: 0,
            itemTotalValue: 0
        }]);
    }

    useEffect(() => {
        setSummary((prev: Summary) => {
            const newSummary = {...prev};
            newSummary.itemsTotalValue = sumKeyValues(items, 'itemTotalValue');
            newSummary.itemsSubtotal = summary.itemsTotalValue + summary.totalDiscount;
            
            return newSummary;
        })
    }, [items])

    return (
        <>
            <table className="break-words w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[38%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                    <col className="w-[2%]" />
                </colgroup>

                <thead>
                    <tr>
                        <th className="">Descrição do Produto/Serviço</th>
                        <th>Quant.</th>
                        <th>Preço Un.</th>
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