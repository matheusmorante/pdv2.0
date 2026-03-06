import React from "react";
import Footer from "./Footer";
import Body from "./Body";
import { Item, ItemsSummary } from "../../../types/items.type";


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
                    unitDiscount: 0,
                    discountType: 'fixed'
                }
            ])
        })
    }

    return (
        <>
            <table className="w-full border-collapse">

                <thead>
                    <tr >
                        <th className="">Descrição do Produto/Serviço</th>
                        <th>Quant.</th>
                        <th>Preço Un.</th>
                        <th>Desconto Unitário</th>
                        <th>Valor Total</th>
                        <td className="border-none">
                            <i onClick={addItem} className="bi bi-plus-lg" />
                        </td>
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