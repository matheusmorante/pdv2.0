import React from "react";
import { stringifyFullAddressWithObservation } from "../../../utils/formatters";
import { getSettings } from "../../../utils/settingsService";

export const CustomerSection = ({ fullName, phone, noPhone }: { fullName?: string, phone?: string, noPhone?: boolean }) => (
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
                {noPhone ? "Sem Telefone" : (phone || "Telefone não informado")}
            </p>
        </div>
    </section>
);

export const ModalityLabelsSection = ({ deliveryMethod }: { deliveryMethod?: string }) => {
    const settings = getSettings();
    const label = deliveryMethod === 'pickup' ? settings.modalityLabels.pickup : settings.modalityLabels.delivery;
    const isPickup = deliveryMethod === 'pickup';

    return (
        <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
                <i className="bi bi-hand-index-thumb-fill" /> Modalidade
            </h3>
            <div className={`p-6 rounded-3xl border transition-colors duration-300 flex items-center gap-3 ${isPickup
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'}`}>
                <i className={`bi ${isPickup ? 'bi-hand-index-thumb-fill' : 'bi-truck'} text-xl`} />
                <span className="text-sm font-black uppercase tracking-widest">{label}</span>
            </div>
        </section>
    );
};

export const OrderTypeSection = ({ orderType }: { orderType?: string }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
            <i className="bi bi-box-seam-fill" /> Tipo de Pedido
        </h3>
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-300 flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <i className="bi bi-tag-fill text-xl opacity-40" />
            <span className="text-sm font-black uppercase tracking-widest">{orderType || "NÃO INFORMADO"}</span>
        </div>
    </section>
);

export const ShippingSection = ({ fullAddress, destinationCoords }: { fullAddress: any, destinationCoords?: [number, number] }) => (
    <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-5 flex items-center gap-2">
            <i className="bi bi-geo-alt-fill" /> Endereço de Entrega
        </h3>
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                {stringifyFullAddressWithObservation(fullAddress)}
            </p>
            {destinationCoords && (
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${destinationCoords[1]},${destinationCoords[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                >
                    <i className="bi bi-geo-fill" />
                    Abrir no Google Maps
                </a>
            )}
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
