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

                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição do Produto/Serviço</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Quant.</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Preço Un.</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Desconto Unitário</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Total</th>
                        <th className="px-4 py-3 text-center border-none bg-transparent">
                            <button
                                type="button"
                                onClick={addItem}
                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                title="Adicionar Item"
                            >
                                <i className="bi bi-plus-lg" />
                            </button>
                        </th>
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