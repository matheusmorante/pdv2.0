import React from "react";
import { NumericFormat } from "react-number-format";
import Shipping from "../../types/Shipping.type";
import CustomerData from "../../types/customerData.type";
import { getShippingRouteUrl } from "../../utils/maps";
import { ValidationErrors } from "../../utils/validations";

interface Props {
    shipping: Shipping,
    setShipping: React.Dispatch<React.SetStateAction<Shipping>>,
    customerData: CustomerData,
    errors: ValidationErrors
}

const ShippingData = ({ shipping, setShipping, customerData, errors }: Props) => {
    const route = getShippingRouteUrl(customerData.fullAddress);

    const onChangeShippingValue = (newValue: number) => {
        setShipping((prev: Shipping) => ({ ...prev, value: newValue }));
    };

    const onChangeDistance = (newValue: string) => {
        const numValue = parseFloat(newValue.replace(',', '.'));
        setShipping((prev: Shipping) => ({ ...prev, distance: isNaN(numValue) ? undefined : numValue }));
    };

    const onChangeScheduling = (
        key: keyof Shipping["scheduling"],
        value: string | Date
    ) => {
        setShipping((prev: Shipping) => {
            const newScheduling = { ...prev.scheduling, [key]: value };

            if (newScheduling.type === 'fixed') {
                newScheduling.time = newScheduling.startTime || '';
            } else {
                newScheduling.time = `${newScheduling.startTime || ''} às ${newScheduling.endTime || ''}`;
            }

            return {
                ...prev,
                scheduling: newScheduling as Shipping["scheduling"],
            };
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Valor do Frete</label>
                        <NumericFormat
                            className={`bg-transparent border-0 border-b px-1 py-3 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${errors['shipping_value'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                                }`}
                            value={shipping.value}
                            allowNegative={false}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                            onValueChange={(values) => onChangeShippingValue(values.floatValue || 0)}
                        />
                        {errors['shipping_value'] && (
                            <div className="text-red-500 text-xs mt-1 ml-1">{errors['shipping_value']}</div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Distância (KM)</label>
                            <a
                                href={route}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest border border-blue-100/50"
                            >
                                <i className="bi bi-geo-alt-fill" /> Ver Rota
                            </a>
                        </div>
                        <input
                            type="text"
                            className="bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 px-1 py-3 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300"
                            value={shipping.distance !== undefined ? shipping.distance.toString().replace('.', ',') : ''}
                            onChange={(e) => onChangeDistance(e.target.value)}
                            placeholder="Ex: 5,5"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 ml-1">Agendamento da Entrega</label>
                    <div className={`bg-white dark:bg-slate-900 border p-6 rounded-[2rem] shadow-sm space-y-4 transition-all ${errors['shipping_date'] || errors['shipping_time']
                        ? 'border-red-500 ring-1 ring-red-500/20'
                        : 'border-slate-100 dark:border-slate-800'
                        }`}>
                        <div className="flex flex-wrap items-center gap-4 relative group">
                            <input
                                type="date"
                                className={`bg-transparent border-0 border-b p-2 outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_date'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                    }`}
                                value={shipping.scheduling.date}
                                onChange={(e) => onChangeScheduling("date", e.target.value)}
                            />
                            {errors['shipping_date'] && (
                                <div className="absolute left-0 -top-10 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                                    {errors['shipping_date']}
                                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                                </div>
                            )}

                            <select
                                className="bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 p-2 focus:border-blue-600 dark:focus:border-blue-500 outline-none text-sm font-bold text-slate-600 dark:text-slate-300 transition-all"
                                value={shipping.scheduling.type || 'fixed'}
                                onChange={(e) => onChangeScheduling("type", e.target.value as any)}
                            >
                                <option value="fixed" className="dark:bg-slate-900">Horário Fixo</option>
                                <option value="range" className="dark:bg-slate-900">Intervalo</option>
                            </select>

                            {shipping.scheduling.type === 'range' ? (
                                <div className="flex items-center gap-3 relative group/time">
                                    <input
                                        type="time"
                                        className={`bg-transparent border-0 border-b p-2 outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                            }`}
                                        value={shipping.scheduling.startTime || ''}
                                        onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                                    />
                                    <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-500 tracking-widest">Até</span>
                                    <input
                                        type="time"
                                        className={`bg-transparent border-0 border-b p-2 outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                            }`}
                                        value={shipping.scheduling.endTime || ''}
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
                                <div className="relative group/time">
                                    <input
                                        type="time"
                                        className={`bg-transparent border-0 border-b p-2 outline-none text-sm transition-all dark:text-slate-300 ${errors['shipping_time'] ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                            }`}
                                        value={shipping.scheduling.startTime || ''}
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
            </div>
        </div>
    );
};

export default ShippingData;