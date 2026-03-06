import Item from '../../../types/items.type';
import { calcItemTotalValue } from '../../../utils/calculations';
import CurrencyOrPercentInput from '../../../../components/CurrencyOrPercentInput';
import UnitInput from './UnitInput';
import CurrencyInput from '../../../../components/CurrencyInput';
import ToggleValueTypeBtn from '../ToggleValueTypeBtn';
import CurrencyDisplay from '../../../../components/CurrencyDisplay';

interface Props {
    item: Item,
    onChange: (idx: number, key: keyof Item, value: number | string) => void,
    onToggleDiscountType: () => void,
    onDelete: () => void,
    idx: number
}

const BodyRow = ({ item, onChange, onToggleDiscountType, onDelete, idx }: Props) => {
    return (
        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
            <td className="px-4 py-2">
                <input
                    className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-500 px-2 py-1.5 outline-none transition-all text-sm placeholder:text-slate-300"
                    placeholder="Descrição do produto..."
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(idx, 'description', e.target.value)
                    }
                />
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
                <div className="flex items-center gap-2 bg-slate-50/50 rounded-lg pr-2 border border-slate-100/50 group-focus-within:border-blue-200 transition-all">
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
                <div className="font-bold text-slate-700">
                    <CurrencyDisplay value={calcItemTotalValue(item)} />
                </div>
            </td>
            <td className="px-4 py-2 text-center border-none">
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir item"
                >
                    <i className="bi bi-trash" />
                </button>
            </td>
        </tr>
    );
};

export default BodyRow;