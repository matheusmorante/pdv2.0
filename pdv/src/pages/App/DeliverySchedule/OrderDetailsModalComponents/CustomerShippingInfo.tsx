import React from "react";
import { stringifyFullAddressWithObservation } from "../../../utils/formatters";

export const CustomerSection = ({ fullName, phone }: { fullName?: string, phone?: string }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
            <i className="bi bi-person-badge-fill" /> Cliente
        </h3>
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <p className="text-lg font-black text-slate-800 dark:text-slate-100 lowercase first-letter:uppercase mb-1">
                {fullName || "Consumidor Não Identificado"}
            </p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <i className="bi bi-telephone-fill text-blue-400" />
                {phone || "Telefone não informado"}
            </p>
        </div>
    </section>
);

export const ShippingSection = ({ fullAddress }: { fullAddress: any }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
            <i className="bi bi-geo-alt-fill" /> Endereço de Entrega
        </h3>
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {stringifyFullAddressWithObservation(fullAddress)}
            </p>
        </div>
    </section>
);

export const SchedulingSection = ({ scheduling }: { scheduling: any }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
            <i className="bi bi-clock-fill" /> Agendamento
        </h3>
        <div className="bg-blue-50/30 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col gap-3 transition-colors duration-300">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Data</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                    {scheduling?.date ? new Date(scheduling.date + "T00:00:00").toLocaleDateString('pt-BR') : "N/A"}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Horário</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                    {scheduling?.startTime || scheduling?.time}
                    {scheduling?.type === 'range' && ` → ${scheduling.endTime}`}
                </span>
            </div>
        </div>
    </section>
);
