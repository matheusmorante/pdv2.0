import React from 'react';
import Item from '../../../types/items.type';
import { calcItemTotalValue } from '../../../utils/calculations';
import CurrencyOrPercentInput from '../../../../components/CurrencyOrPercentInput';
import UnitInput from './UnitInput';
import CurrencyInput from '../../../../components/CurrencyInput';
import ToggleValueTypeBtn from '../ToggleValueTypeBtn';
import CurrencyDisplay from '../../../../components/CurrencyDisplay';
import { ValidationErrors } from '../../../utils/validations';

interface Props {
    item: Item,
    onChange: (idx: number, key: keyof Item, value: number | string) => void,
    onToggleDiscountType: () => void,
    onDelete: () => void,
    idx: number,
    deliveryMethod: 'delivery' | 'pickup',
    errors: ValidationErrors
}

const BodyRow = ({ item, onChange, onToggleDiscountType, onDelete, idx, deliveryMethod, errors }: Props) => {
    const errorKey = `item_${idx}_description`;
    const error = errors[errorKey];

    return (
        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-4 py-2 relative group/desc">
                <input
                    className={`w-full bg-transparent border-0 border-b px-2 py-1.5 outline-none transition-all text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-200 ${error ? 'border-red-500 ring-1 ring-red-500/10' : 'border-transparent focus:border-blue-500'
                        }`}
                    placeholder="Descrição do produto..."
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(idx, 'description', e.target.value)
                    }
                />
                {error && (
                    <div className="absolute left-4 -top-8 hidden group-hover/desc:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap">
                        {error}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                    </div>
                )}
            </td>
            <td className="px-4 py-2">
                <select
                    className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 px-1 py-1.5 outline-none transition-all text-[11px] font-bold text-slate-600 dark:text-slate-400"
                    value={item.handlingType}
                    onChange={(e) => onChange(idx, 'handlingType', e.target.value)}
                >
                    {deliveryMethod === 'delivery' ? (
                        <>
                            <option value="Entrega com montagem no local" className="dark:bg-slate-900">Entrega com montagem</option>
                            <option value="Entrega na caixa (montagem por conta do cliente)" className="dark:bg-slate-900">Entrega na caixa (cliente)</option>
                            <option value="Entrega de item do mostruário – desmontar na loja e montar no local" className="dark:bg-slate-900">Mostruário p/ montar</option>
                            <option value="Entrega de item do mostruário – levar montado" className="dark:bg-slate-900">Mostruário montado</option>
                        </>
                    ) : (
                        <>
                            <option value="Retirada na loja – produto na caixa" className="dark:bg-slate-900">Retirada na caixa</option>
                            <option value="Retirada na loja – item do mostruário montado" className="dark:bg-slate-900">Retirada mostruário montado</option>
                            <option value="Retirada na loja – item do mostruário desmontado" className="dark:bg-slate-900">Retirada mostruário desmontado</option>
                        </>
                    )}
                </select>
            </td>
            <td className="px-4 py-2">
                <UnitInput
                    value={item.quantity}
                    onChange={(value: number) => onChange(idx, 'quantity', value)}
                />
            </td>
            <td className="px-4 py-2">
                <CurrencyInput
                    value={item.unitPrice}
                    onChange={(value: number) => onChange(idx, 'unitPrice', value)}
                />
            </td>
            <td className="px-4 py-2">
                <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg pr-2 border border-slate-100/50 dark:border-slate-800/50 group-focus-within:border-blue-200 dark:group-focus-within:border-blue-500/30 transition-all">
                    <CurrencyOrPercentInput
                        prefix={item.discountType === "fixed" ? "R$ " : ""}
                        suffix={item.discountType === "fixed" ? "" : " %"}
                        value={item.unitDiscount}
                        onChange={(value: number) => onChange(idx, 'unitDiscount', value)}
                    />
                    <ToggleValueTypeBtn onClick={onToggleDiscountType}>
                        {item.discountType === 'fixed' ? 'R$' : '%'}
                    </ToggleValueTypeBtn>
                </div>
            </td>
            <td className="px-4 py-2 text-right">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                    <CurrencyDisplay value={calcItemTotalValue(item)} />
                </div>
            </td>
            <td className="px-4 py-2 text-center border-none">
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir item"
                >
                    <i className="bi bi-trash" />
                </button>
            </td>
        </tr>
    );
};

export default BodyRow;