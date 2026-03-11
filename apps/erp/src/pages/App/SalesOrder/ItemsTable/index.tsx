import React from "react";
import Footer from "./Footer";
import Body from "./Body";
import { Item, ItemsSummary } from "../../../types/items.type";
import { ValidationErrors } from "../../../utils/validations";

interface Props {
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>
    summary: ItemsSummary,
    deliveryMethod: 'delivery' | 'pickup',
    errors: ValidationErrors
}

const ItemsTable = ({ items, setItems, summary, deliveryMethod, errors }: Props) => {
    const addItem = () => {
        setItems((prev: Item[]) => {
            return ([
                ...prev,
                {
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    unitDiscount: 0,
                    discountType: 'fixed',
                    handlingType: deliveryMethod === 'delivery' ? 'com montagem' : 'na caixa ( sem montagem)'
                }
            ])
        })
    }

    return (
        <>
            <table className="w-full border-collapse">

                <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                    <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 min-w-[200px]">Descrição</th>
                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[130px]">Manuseio</th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[80px]">Qtd.</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[110px]">Preço Un.</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[120px]">Desconto</th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[110px]">Total</th>
                        <th className="px-4 py-3 text-center border-none bg-transparent w-[60px]">
                            <button
                                type="button"
                                onClick={addItem}
                                className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all shadow-sm border border-blue-100 dark:border-blue-800"
                                title="Adicionar Item"
                            >
                                <i className="bi bi-plus-lg" />
                            </button>
                        </th>
                    </tr>
                </thead>

                <Body items={items} setItems={setItems} deliveryMethod={deliveryMethod} errors={errors} />

                <Footer
                    summary={summary}
                />

            </table >

        </>

    )
}

export default ItemsTable