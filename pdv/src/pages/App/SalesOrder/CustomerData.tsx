import React from "react";
import CustomerData from "../../types/customerData.type";
import { getAddressByCep, getShippingRouteUrl } from "../../utils/maps";
import { sanitizeNumber } from "../../utils/sanitization";
import { toTitleCase } from "../../utils/formatters";
import ValidatedInput from "../../../components/ValidatedInput";
import { ValidationErrors } from "../../utils/validations";

interface Props {
    customerData: CustomerData,
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>,
    errors: ValidationErrors
}

const CustomerDataInputs = ({ customerData, setCustomerData, errors }: Props) => {
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
                <ValidatedInput
                    label="Nome Completo"
                    value={customerData.fullName}
                    onChange={e => onChangeCustomerData('fullName', e.target.value)}
                    placeholder="Nome do Cliente"
                    error={errors['customer_fullName']}
                />
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Celular / WhatsApp</label>
                        <a
                            href={`https://wa.me/${customerData.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-[10px] font-black uppercase tracking-widest border border-green-100/50 dark:border-green-900/30"
                        >
                            <i className="bi bi-whatsapp" /> Verificar
                        </a>
                    </div>
                    <ValidatedInput
                        name="phone"
                        value={customerData.phone}
                        onChange={e => onChangeCustomerData('phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        error={errors['customer_phone']}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <ValidatedInput
                    containerClassName="md:col-span-2"
                    label="CEP"
                    name="cep"
                    value={customerData.fullAddress.cep}
                    onChange={e => onChangeAddress('cep', e.target.value)}
                    placeholder="00000-000"
                />
                <div className="md:col-span-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Logradouro</label>
                        <a
                            href={route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-900/30"
                        >
                            <i className="bi bi-geo-alt-fill" /> Maps
                        </a>
                    </div>
                    <ValidatedInput
                        name="street"
                        value={customerData.fullAddress.street}
                        onChange={e => onChangeAddress('street', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        error={errors['customer_street']}
                    />
                </div>
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
