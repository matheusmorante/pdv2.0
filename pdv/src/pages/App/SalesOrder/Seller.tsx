import React from "react";
interface props {
    seller: string;
    setSeller: React.Dispatch<React.SetStateAction<string>>
}

const Seller = ({ seller, setSeller }: props) => {
    return (
        <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Vendedor</label>
            <input
                className="bg-transparent border-0 border-b border-slate-200 px-1 py-3 focus:border-blue-600 transition-all text-sm outline-none placeholder:text-slate-300"
                value={seller}
                onChange={
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                        setSeller(e.target.value)
                }
                name="seller"
                placeholder="Nome do Vendedor"
            />
        </div>
    )
}
export default Seller;