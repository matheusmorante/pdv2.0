import React from "react";
import { NumericFormat } from "react-number-format";
import { ValidationErrors } from "../../../utils/validations";

interface FreteDistanciaProps {
    value: number;
    distance?: number;
    routeUrl: string;
    onChangeValue: (val: number) => void;
    onChangeDistance: (val: string) => void;
    onAutoCalculateDistance?: () => void;
    autoCalculateValue?: boolean;
    onToggleAutoCalculate?: () => void;
    isCalculatingDistance?: boolean;
    errors: ValidationErrors;
}

const FreteDistancia = ({ value, distance, routeUrl, onChangeValue, onChangeDistance, onAutoCalculateDistance, autoCalculateValue, onToggleAutoCalculate, isCalculatingDistance, errors }: FreteDistanciaProps) => (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
        <div className="flex flex-col relative group justify-end">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                <div className="flex justify-between items-center w-full">
                    <span>Valor do Frete</span>
                    {onToggleAutoCalculate && (
                        <button
                            type="button"
                            onClick={onToggleAutoCalculate}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest border ${autoCalculateValue
                                ? 'bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-200'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            title={autoCalculateValue ? "Cálculo automático de frete ativado" : "Cálculo automático de frete desativado"}
                        >
                            <i className={`bi ${autoCalculateValue ? 'bi-lightning-charge-fill' : 'bi-lightning-charge'}`} />
                            {autoCalculateValue ? 'Automático: ON' : 'Automático: OFF'}
                        </button>
                    )}
                </div>
            </label>
            <div className="relative">
                <NumericFormat
                    className={`w-full bg-transparent border-0 border-b px-1 py-3 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${errors['shipping_value'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                    value={value}
                    allowNegative={false}
                    thousandSeparator="."
                    prefix={"R$ "}
                    decimalScale={2}
                    decimalSeparator=","
                    onFocus={(e) => e.target.select()}
                    onValueChange={(values) => onChangeValue(values.floatValue || 0)}
                />
                {errors['shipping_value'] && (
                    <div className="absolute left-0 -top-8 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                        {errors['shipping_value']}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                    </div>
                )}
            </div>
        </div>
        <div className="flex flex-col relative group justify-end">
            <div className="flex justify-between items-center mb-2 px-1 w-full gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">Distância KM (Somente Ida)</label>
                <div className="flex items-center gap-2">
                    {onAutoCalculateDistance && (
                        <button
                            onClick={onAutoCalculateDistance}
                            disabled={isCalculatingDistance}
                            className={`flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 -my-1 whitespace-nowrap ${isCalculatingDistance ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Calcular automaticamente a distância usando o endereço do cliente"
                        >
                            {isCalculatingDistance ? (
                                <i className="bi bi-hourglass-split animate-spin" />
                            ) : (
                                <i className="bi bi-magic" />
                            )}
                            Calcular
                        </button>
                    )}
                    <a
                        href={routeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest border border-blue-100/50 -my-1 whitespace-nowrap"
                        title="Ver rota de entrega no Google Maps"
                    >
                        <i className="bi bi-geo-alt-fill" /> Ver Rota
                    </a>
                </div>
            </div>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 px-1 py-3 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300"
                    value={distance !== undefined ? distance.toString().replace('.', ',') : ''}
                    onChange={(e) => onChangeDistance(e.target.value)}
                    placeholder="Ex: 5,5"
                />
            </div>
        </div>
    </div>
);

export default FreteDistancia;
