import React from "react";
import Shipping from "../../../types/Shipping.type";
import { ValidationErrors } from "../../../utils/validations";

interface AgendamentoProps {
    scheduling: Shipping["scheduling"];
    onChangeScheduling: (key: keyof Shipping["scheduling"], value: string | Date) => void;
    errors: ValidationErrors;
    isPickup?: boolean;
}

const Agendamento = ({ scheduling, onChangeScheduling, errors, isPickup }: AgendamentoProps) => {
    const hasError = errors['shipping_date'] || errors['shipping_time'];

    return (
        <div className="flex-1 flex flex-col min-w-0">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 ml-1">
                {isPickup ? 'Agendamento da Retirada' : 'Agendamento da Entrega'}
            </label>
            <div className={`bg-white dark:bg-slate-900 border p-4 sm:p-5 lg:p-6 rounded-3xl sm:rounded-[2rem] shadow-sm w-full transition-all ${hasError ? 'border-red-500 ring-4 ring-red-500/10 shadow-lg shadow-red-100 dark:shadow-red-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 relative group w-full">
                    {/* Date */}
                    <div className="flex-1 min-w-[140px] w-full relative">
                        <input
                            type="date"
                            className={`w-full bg-transparent border px-3 py-2 rounded-xl outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_date'] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'}`}
                            value={scheduling.date}
                            onChange={(e) => onChangeScheduling("date", e.target.value)}
                        />
                        {errors['shipping_date'] && (
                            <div className="absolute left-0 -top-10 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                                {errors['shipping_date']}
                                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                            </div>
                        )}
                    </div>

                    {/* Type Select */}
                    <div className="w-full sm:w-auto min-w-[120px]">
                        <select
                            className="w-full bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 p-2 focus:border-blue-600 dark:focus:border-blue-500 outline-none text-sm font-bold text-slate-600 dark:text-slate-300 transition-all"
                            value={scheduling.type || 'fixed'}
                            onChange={(e) => onChangeScheduling("type", e.target.value as any)}
                        >
                            <option value="fixed" className="dark:bg-slate-900">Horário Fixo</option>
                            <option value="range" className="dark:bg-slate-900">Intervalo</option>
                        </select>
                    </div>

                    {/* Time Inputs */}
                    {scheduling.type === 'range' ? (
                        <div className="flex flex-1 flex-row items-center gap-3 relative group/time min-w-[200px] w-full">
                            <input
                                type="time"
                                className={`w-full bg-transparent border px-3 py-2 rounded-xl outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'}`}
                                value={scheduling.startTime || ''}
                                onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                            />
                            <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-500 tracking-widest shrink-0">Até</span>
                            <input
                                type="time"
                                className={`w-full bg-transparent border px-3 py-2 rounded-xl outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'}`}
                                value={scheduling.endTime || ''}
                                onChange={(e) => onChangeScheduling("endTime", e.target.value)}
                            />
                            {errors['shipping_time'] && (
                                <div className="absolute left-0 -top-10 hidden group-hover/time:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                                    {errors['shipping_time']}
                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 min-w-[120px] w-full relative group/time">
                            <input
                                type="time"
                                    className={`w-full bg-transparent border px-3 py-2 rounded-xl outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'}`}
                                value={scheduling.startTime || ''}
                                onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                            />
                            {errors['shipping_time'] && (
                                <div className="absolute left-0 -top-10 hidden group-hover/time:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                                    {errors['shipping_time']}
                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Agendamento;
