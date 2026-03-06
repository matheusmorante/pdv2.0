import React from "react";
import { NumericFormat } from "react-number-format";
import Shipping from "../../types/Shipping.type";

import CustomerData from "../../types/customerData.type";
import { getShippingRouteUrl } from "../../utils/maps";

interface Props {
    shipping: Shipping,
    setShipping: React.Dispatch<React.SetStateAction<Shipping>>,
    customerData: CustomerData
}

const ShippingData = ({ shipping, setShipping, customerData }: Props) => {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Valor do Frete</label>
                    <NumericFormat
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={shipping.value}
                        allowNegative={false}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        onValueChange={(values) => onChangeShippingValue(values.floatValue || 0)}
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Distância (KM)</label>
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
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={shipping.distance !== undefined ? shipping.distance.toString().replace('.', ',') : ''}
                        onChange={(e) => onChangeDistance(e.target.value)}
                        placeholder="Ex: 5,5"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Agendamento da Entrega</label>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="date"
                            className="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm shadow-sm"
                            value={shipping.scheduling.date}
                            onChange={(e) => onChangeScheduling("date", e.target.value)}
                        />

                        <select
                            className="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm shadow-sm font-bold text-slate-600"
                            value={shipping.scheduling.type || 'fixed'}
                            onChange={(e) => onChangeScheduling("type", e.target.value as any)}
                        >
                            <option value="range">Período</option>
                            <option value="fixed">Horário Fixo</option>
                        </select>

                        {shipping.scheduling.type === 'range' ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="time"
                                    className="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm shadow-sm"
                                    value={shipping.scheduling.startTime || ''}
                                    onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                                />
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Até</span>
                                <input
                                    type="time"
                                    className="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm shadow-sm"
                                    value={shipping.scheduling.endTime || ''}
                                    onChange={(e) => onChangeScheduling("endTime", e.target.value)}
                                />
                            </div>
                        ) : (
                            <input
                                type="time"
                                className="bg-white border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/10 outline-none text-sm shadow-sm"
                                value={shipping.scheduling.startTime || ''}
                                onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingData;