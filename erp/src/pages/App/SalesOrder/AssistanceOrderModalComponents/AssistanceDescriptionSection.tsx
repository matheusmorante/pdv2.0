import React from "react";
import SmartInput from "../../../../components/SmartInput";
import NoticeInput from "../../../../components/NoticeInput";

interface AssistanceDescriptionSectionProps {
    description: string;
    setDescription: (val: string) => void;
    observation: string;
    setObservation: (val: string) => void;
    assistanceServiceValue: number;
    setAssistanceServiceValue: (val: number) => void;
    assistanceCost: number;
    setAssistanceCost: (val: number) => void;
    errors: Record<string, string>;
}

const AssistanceDescriptionSection = ({
    description,
    setDescription,
    observation,
    setObservation,
    assistanceServiceValue,
    setAssistanceServiceValue,
    assistanceCost,
    setAssistanceCost,
    errors
}: AssistanceDescriptionSectionProps) => (
    <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <i className="bi bi-clipboard-fill text-amber-500" />
            Detalhes da Assistência
        </h3>
        <div className="flex flex-col gap-2 relative group/field">
            <SmartInput
                 label="Descrição do Serviço *"
                 required
                 value={description}
                 onValueChange={(val: string) => setDescription(val)}
                 tableName="orders"
                 columnName="assistanceDescription"
                 placeholder="Descreva o problema ou solicitação..."
                 icon="bi-wrench"
                 error={!!errors.assistanceDescription}
            />
            {errors.assistanceDescription && (
                <div className="absolute left-0 -top-7 hidden group-hover/field:flex items-center px-2 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded shadow-lg z-50 whitespace-nowrap animate-fade-in">
                    {errors.assistanceDescription}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                </div>
            )}
        </div>
        <div className="flex flex-col gap-2 mt-4 px-1">
            <NoticeInput
                label="Avisos Importantes / Alertas"
                value={observation}
                onChange={setObservation}
                placeholder="Alertas de entrega, observações críticas ou raridade..."
            />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Valor do Serviço (Cliente)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600">R$</span>
                    <input
                        type="number"
                        step="0.01"
                        value={assistanceServiceValue}
                        onChange={(e) => setAssistanceServiceValue(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-sm font-black text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                        placeholder="0,00"
                    />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter px-1">Valor cobrado do cliente</p>
            </div>

            <div className="flex flex-col gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Custo Interno
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">R$</span>
                    <input
                        type="number"
                        step="0.01"
                        value={assistanceCost}
                        onChange={(e) => setAssistanceCost(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
                        placeholder="0,00"
                    />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter px-1">Custo interno de mão de obra</p>
            </div>
        </div>
    </div>
);

export default AssistanceDescriptionSection;
