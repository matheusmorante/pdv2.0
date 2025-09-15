import React from "react";
import Footer from "./Footer";
import Body from "./Body";
import {Item, ItemsSummary } from "../../types/items.type";


interface Props {
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>
    summary: ItemsSummary
}

const ItemsTable = ({ items, setItems, summary }: Props) => {
    const addItem = () => {
        setItems((prev: Item[]) => {
            return ([
                ...prev,
                {
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    fixedDiscount: 0,
                    percentDiscount: 0,
                }
            ])
        })
    }

    return (
        <>
            <table className="break-words w-full table-fixed border-collapse
                ">
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
                    summary={summary}
                />

            </table >

        </>

    )
}

export default ItemsTable