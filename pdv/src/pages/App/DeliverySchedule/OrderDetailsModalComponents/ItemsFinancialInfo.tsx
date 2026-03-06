import React from "react";

export const ItemsTable = ({ items }: { items: any[] }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-5 flex items-center gap-2">
            <i className="bi bi-box-seam-fill" /> Itens do Pedido
        </h3>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Qtd</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Produto</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items?.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-black text-slate-800">{item.quantity}x</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600 truncate max-w-[150px]">{item.description}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-800 text-right">
                                {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

export const FinancialSummary = ({ itemsSummary, shippingValue, totalValue }: { itemsSummary: any, shippingValue: number, totalValue: number }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-5 flex items-center gap-2">
            <i className="bi bi-wallet2" /> Resumo Financeiro
        </h3>
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white space-y-4">
            <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold">
                    {itemsSummary?.itemsTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest">Frete</span>
                <span className="text-sm font-bold">
                    {shippingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div className="h-px bg-white/10 my-4"></div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Total Geral</span>
                <span className="text-2xl font-black text-blue-400">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
        </div>
    </section>
);
