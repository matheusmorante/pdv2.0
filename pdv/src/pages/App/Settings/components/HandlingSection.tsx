/** @jsxImportSource react */
import React from "react";
import { AppSettings } from "../../../utils/settingsService";

interface Props {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

export default function HandlingSection({ settings, onChange }: Props): any {
    const renderOptionList = (title: string, options: string[], path: string) => (
        <div className="p-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-6 block">{title}</h5>
            <div className="flex flex-col gap-3">
                {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 animate-slide-left" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between group">
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const next = [...options];
                                    next[idx] = e.target.value;
                                    onChange(path, next);
                                }}
                                className="flex-1 bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 rounded-lg outline-none transition-all placeholder:text-slate-300"
                                placeholder="Nome da opção"
                            />
                            <div className="flex items-center gap-2 ml-2">
                                <button 
                                    onClick={() => {
                                        const next = [...options];
                                        next.splice(idx, 1);
                                        onChange(path, next);
                                    }}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    title="Remover opção"
                                >
                                    <i className="bi bi-trash3-fill" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={() => {
                        onChange(path, [...options, "Nova Opção"]);
                    }}
                    className="mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-2"
                >
                    <i className="bi bi-plus-circle-fill" />
                    Adicionar Nova Opção
                </button>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 divide-y md:divide-y-0 md:divide-x divide-slate-50 dark:divide-slate-800/50">
            {renderOptionList(
                "Manuseio para Entrega", 
                settings.deliveryHandlingOptions, 
                "deliveryHandlingOptions"
            )}
            {renderOptionList(
                "Manuseio para Retirada", 
                settings.pickupHandlingOptions, 
                "pickupHandlingOptions"
            )}
        </div>
    );
}
