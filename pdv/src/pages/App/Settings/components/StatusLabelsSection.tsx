/** @jsxImportSource react */
import React from "react";
import { AppSettings, OrderStatusConfig } from "../../../utils/settingsService";

interface Props {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

const COLOR_OPTIONS = [
    { value: 'slate', dot: 'bg-slate-500', hover: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
    { value: 'amber', dot: 'bg-amber-500', hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40' },
    { value: 'emerald', dot: 'bg-emerald-500', hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40' },
    { value: 'rose', dot: 'bg-rose-500', hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40' },
    { value: 'blue', dot: 'bg-blue-500', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40' },
    { value: 'purple', dot: 'bg-purple-500', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40' },
] as const;

export default function StatusLabelsSection({ settings, onChange }: Props): any {
    const statuses = settings.orderStatuses || [];

    const updateStatus = (index: number, changes: Partial<OrderStatusConfig>) => {
        const next = [...statuses];
        next[index] = { ...next[index], ...changes };
        onChange('orderStatuses', next);
    };

    const addStatus = () => {
        const newId = `custom_${Date.now()}`;
        const next = [...statuses, { id: newId, label: 'Novo Status', color: 'blue', isCore: false }];
        onChange('orderStatuses', next);
    };

    const removeStatus = (index: number) => {
        const next = [...statuses];
        next.splice(index, 1);
        onChange('orderStatuses', next);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 divide-y md:divide-y-0 md:divide-x divide-slate-50 dark:divide-slate-800/50 border-b border-slate-50 dark:border-slate-800/50">
            {/* Status Labels */}
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-0">Status de Pedidos</h5>
                    <button 
                        onClick={addStatus}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                    >
                        <i className="bi bi-plus-lg mr-1"/> Adicionar
                    </button>
                </div>
                
                <div className="space-y-3">
                    {statuses.map((status, index) => (
                        <div key={status.id} className="group flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:border-slate-300 dark:hover:border-slate-700 animate-slide-down">
                            <div className="flex items-center gap-3">
                                {/* Color Selector Button */}
                                <div className="relative group/picker">
                                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                        <div className={`w-3 h-3 rounded-full ${COLOR_OPTIONS.find(c => c.value === status.color)?.dot || 'bg-slate-500'}`} />
                                    </button>
                                    
                                    {/* Color Picker Dropdown */}
                                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-10 hidden group-hover/picker:flex flex-wrap w-40 gap-1 animate-slide-up">
                                        {COLOR_OPTIONS.map(opt => (
                                            <button 
                                                key={opt.value} 
                                                onClick={() => updateStatus(index, { color: opt.value as any })}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${opt.hover}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full ${opt.dot} ${status.color === opt.value ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Label Input (Inline Edit) */}
                                <input 
                                    type="text" 
                                    value={status.label} 
                                    onChange={(e) => updateStatus(index, { label: e.target.value })}
                                    className="flex-1 bg-transparent border-none px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 rounded-lg outline-none transition-all placeholder:text-slate-300"
                                    placeholder="Nome do status"
                                />

                                {/* Delete Button (Only for non-core) */}
                                {!status.isCore ? (
                                    <button 
                                        onClick={() => removeStatus(index)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                        title="Remover status"
                                    >
                                        <i className="bi bi-trash3-fill" />
                                    </button>
                                ) : (
                                    <div className="p-2 opacity-50 text-[10px] font-bold text-slate-400" title="Status de sistema">
                                        <i className="bi bi-lock-fill" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Type Labels */}
            <div className="p-8 space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-4">Tipos de Pedido</h5>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entrega / Serviço</label>
                        <input 
                            type="text" 
                            value={settings.orderTypeLabels.delivery}
                            onChange={(e) => onChange('orderTypeLabels.delivery', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all dark:text-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Retirada</label>
                        <input 
                            type="text" 
                            value={settings.orderTypeLabels.pickup}
                            onChange={(e) => onChange('orderTypeLabels.pickup', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all dark:text-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assistência</label>
                        <input
                            type="text"
                            value={settings.orderTypeLabels.assistance}
                            onChange={(e) => onChange('orderTypeLabels.assistance', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500 outline-none transition-all dark:text-slate-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
