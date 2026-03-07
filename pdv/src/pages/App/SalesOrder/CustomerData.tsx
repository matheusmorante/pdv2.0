import React, { ChangeEvent } from "react";
import CustomerData from "../../types/customerData.type";
import { getAddressByCep, getShippingRouteUrl } from "../../utils/maps";
import { sanitizeNumber } from "../../utils/sanitization";
import { toTitleCase } from "../../utils/formatters";
import ValidatedInput from "../../../components/ValidatedInput";
import { ValidationErrors } from "../../utils/validations";

import { PatternFormat } from "react-number-format";
import { getSettings } from "../../utils/settingsService";

interface Props {
    customerData: CustomerData,
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>,
    errors: ValidationErrors
}


const CustomerDataInputs = ({ customerData, setCustomerData, errors }: Props) => {
    const route = getShippingRouteUrl(customerData.fullAddress)
    const settings = getSettings();

    const onChangeCustomerData = (key: keyof CustomerData, value: string | boolean) => {
        const shouldCapitalize = settings.autoCapitalizeCustomerData;
        const formattedValue = (key === 'fullName' && typeof value === 'string' && shouldCapitalize) ? toTitleCase(value) : value;
        setCustomerData((prev: CustomerData) => ({ ...prev, [key]: formattedValue }))
    }

    const onChangeAddress = async (
        key: keyof CustomerData['fullAddress'],
        value: string
    ) => {
        // Capitalize all except CEP and number if setting is enabled
        const shouldCapitalize = settings.autoCapitalizeCustomerData;
        const formattedValue = (key !== 'cep' && key !== 'number' && shouldCapitalize) ? toTitleCase(value) : value;
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
                    street: shouldCapitalize ? toTitleCase(addressViaCep.street) : addressViaCep.street,
                    neighborhood: shouldCapitalize ? toTitleCase(addressViaCep.neighborhood) : addressViaCep.neighborhood,
                    city: shouldCapitalize ? toTitleCase(addressViaCep.city) : addressViaCep.city,
                },
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                    label="Nome Completo"
                    value={customerData.fullName}
                    onChange={e => onChangeCustomerData('fullName', e.target.value)}
                    placeholder="Nome do Cliente"
                    error={errors['customer_fullName']}
                />
                <div className="flex flex-col relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                        <div className="flex justify-between items-center w-full">
                            <span>Celular / WhatsApp</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const newValue = !customerData.noPhone;
                                        onChangeCustomerData('noPhone', newValue);
                                        if (newValue) onChangeCustomerData('phone', '');
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest border ${customerData.noPhone
                                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <i className={`bi ${customerData.noPhone ? 'bi-telephone-minus-fill' : 'bi-telephone'}`} />
                                    {customerData.noPhone ? 'Sem Telefone' : 'Tenho Telefone'}
                                </button>
                                {!customerData.noPhone && customerData.phone && (
                                    <a
                                        href={`https://wa.me/${customerData.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-[10px] font-black uppercase tracking-widest border border-green-100/50 dark:border-green-900/30"
                                    >
                                        <i className="bi bi-whatsapp" /> Verificar
                                    </a>
                                )}
                            </div>
                        </div>
                    </label>
                    <div className="relative">
                        {customerData.noPhone ? (
                            <div className="w-full bg-slate-50 dark:bg-slate-900/50 border-b border-dashed border-slate-200 dark:border-slate-800 px-1 py-3 text-sm italic text-slate-400 dark:text-slate-600 select-none">
                                Telefone desabilitado
                            </div>
                        ) : (
                            customerData.phone.startsWith('+') || customerData.phone.length > 11 ? (
                                <input
                                    type="text"
                                    className={`w-full bg-transparent border-0 border-b px-1 py-3 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${errors['customer_phone']
                                        ? 'border-red-500 dark:border-red-500/50 focus:border-red-600'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                        }`}
                                    value={customerData.phone}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeCustomerData('phone', e.target.value)}
                                    placeholder="+00 00 00000-0000"
                                />
                            ) : (
                                <PatternFormat
                                    format="(##) #####-####"
                                    mask="_"
                                    className={`w-full bg-transparent border-0 border-b px-1 py-3 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${errors['customer_phone']
                                        ? 'border-red-500 dark:border-red-500/50 focus:border-red-600'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                                        }`}
                                    value={customerData.phone}
                                            onValueChange={(values) => onChangeCustomerData('phone', values.value)}
                                            placeholder="(00) 00000-0000"
                                        />
                            )
                        )}
                        {errors['customer_phone'] && !customerData.noPhone && (
                            <div className="absolute left-0 -top-8 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                                {errors['customer_phone']}
                                <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 flex flex-col relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                        CEP
                    </label>
                    <div className="relative">
                        <PatternFormat
                            format="#####-###"
                            mask="_"
                            className="w-full bg-transparent border-0 border-b border-slate-100 dark:border-slate-800 px-1 py-3 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-sm font-bold outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300"
                            value={customerData.fullAddress.cep}
                            onValueChange={(values) => onChangeAddress('cep', values.value)}
                            placeholder="00000-000"
                        />
                    </div>
                </div>
                <ValidatedInput
                    containerClassName="flex-1"
                    name="street"
                    label={
                        <div className="flex justify-between items-center w-full gap-2">
                            <span>Logradouro</span>
                            <a
                                href={route}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/30 -my-1 shrink-0"
                            >
                                <i className="bi bi-geo-alt-fill" /> <span className="hidden sm:inline">Maps</span>
                            </a>
                        </div>
                    }
                    value={customerData.fullAddress.street}
                    onChange={e => onChangeAddress('street', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                    error={errors['customer_street']}
                />
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
                <ValidatedInput
                    label="Nº"
                    value={customerData.fullAddress.number}
                    onChange={e => onChangeAddress('number', e.target.value)}
                    error={errors['customer_number']}
                />
                <ValidatedInput
                    containerClassName="col-span-2 md:col-span-3"
                    label="Complemento"
                    value={customerData.fullAddress.complement}
                    onChange={e => onChangeAddress('complement', e.target.value)}
                    placeholder="Apto, Bloco, etc."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                    label="Bairro"
                    value={customerData.fullAddress.neighborhood}
                    onChange={e => onChangeAddress('neighborhood', e.target.value)}
                    error={errors['customer_neighborhood']}
                />
                <ValidatedInput
                    label="Cidade"
                    value={customerData.fullAddress.city}
                    onChange={e => onChangeAddress('city', e.target.value)}
                    error={errors['customer_city']}
                />
            </div>

            <ValidatedInput
                label="Observações sobre o endereço"
                name="observation"
                onChange={e => onChangeAddress('observation', e.target.value)}
                placeholder="Ponto de referência, etc."
                value={customerData.fullAddress.observation}
            />
        </div>
    )
}
export default CustomerDataInputs;
