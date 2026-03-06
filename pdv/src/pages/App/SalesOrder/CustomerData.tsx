import React from "react";
import CustomerData from "../../types/customerData.type";
import { getAddressByCep, getShippingRouteUrl } from "../../utils/maps";
import { sanitizeNumber } from "../../utils/sanitization";
import { toTitleCase } from "../../utils/formatters";

interface Props {
    customerData: CustomerData,
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>
}

const CustomerDataInputs = ({ customerData, setCustomerData }: Props) => {
    const route = getShippingRouteUrl(customerData.fullAddress)
    const onChangeCustomerData = (key: keyof CustomerData, value: string) => {
        const formattedValue = key === 'fullName' ? toTitleCase(value) : value;
        setCustomerData((prev: CustomerData) => ({ ...prev, [key]: formattedValue }))
    }

    const onChangeAddress = async (
        key: keyof CustomerData['fullAddress'],
        value: string
    ) => {
        const fieldsToCapitalize: (keyof CustomerData['fullAddress'])[] =
            ['street', 'complement', 'neighborhood', 'city', 'observation'];

        const formattedValue = fieldsToCapitalize.includes(key) ? toTitleCase(value) : value;
        const finalValue = key === 'cep' ? sanitizeNumber(formattedValue) : formattedValue;

        setCustomerData(prev => ({
            ...prev,
            fullAddress: {
                ...prev.fullAddress,
                [key]: finalValue,
            },
        }));

        if (key === 'cep' && finalValue.length === 8) {
            const addressViaCep = await getAddressByCep(finalValue);
            setCustomerData(prev => ({
                ...prev,
                fullAddress: {
                    ...prev.fullAddress,
                    street: toTitleCase(addressViaCep.street),
                    neighborhood: toTitleCase(addressViaCep.neighborhood),
                    city: toTitleCase(addressViaCep.city),
                },
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nome Completo</label>
                    <input
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.fullName}
                        onChange={e => onChangeCustomerData('fullName', e.target.value)}
                        placeholder="Nome do Cliente"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celular / WhatsApp</label>
                        <a
                            href={`https://wa.me/${customerData.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-[10px] font-black uppercase tracking-widest border border-green-100/50"
                        >
                            <i className="bi bi-whatsapp" /> Verificar
                        </a>
                    </div>
                    <input
                        name="phone"
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.phone}
                        onChange={e => onChangeCustomerData('phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-2 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">CEP</label>
                    <input
                        name="cep"
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.fullAddress.cep}
                        onChange={e => onChangeAddress('cep', e.target.value)}
                        placeholder="00000-000"
                    />
                </div>
                <div className="md:col-span-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logradouro</label>
                        <a
                            href={route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest border border-blue-100/50"
                        >
                            <i className="bi bi-geo-alt-fill" /> Maps
                        </a>
                    </div>
                    <input
                        name="street"
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.fullAddress.street}
                        onChange={e => onChangeAddress('street', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nº</label>
                    <input
                        value={customerData.fullAddress.number}
                        onChange={e => onChangeAddress('number', e.target.value)}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                    />
                </div>
                <div className="col-span-2 md:col-span-3 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Complemento</label>
                    <input
                        value={customerData.fullAddress.complement}
                        onChange={e => onChangeAddress('complement', e.target.value)}
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        placeholder="Apto, Bloco, etc."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Bairro</label>
                    <input
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.fullAddress.neighborhood}
                        onChange={e => onChangeAddress('neighborhood', e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Cidade</label>
                    <input
                        className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                        value={customerData.fullAddress.city}
                        onChange={e => onChangeAddress('city', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Observações sobre o endereço</label>
                <input
                    name="observation"
                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm outline-none placeholder:text-slate-300 shadow-sm"
                    onChange={e => onChangeAddress('observation', e.target.value)}
                    placeholder="Ponto de referência, etc."
                    value={customerData.fullAddress.observation}
                />
            </div>
        </div>
    )
}
export default CustomerDataInputs;