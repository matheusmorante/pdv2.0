import Item from '../../types/items.type';
import { calcItemTotalValue } from '../../utils/calculations';
import CurrencyOrPercentInput from '../../../components/CurrencyOrPercentInput';
import UnitInput from './UnitInput';
import CurrencyInput from '../../../components/CurrencyInput';
import ToggleValueTypeBtn from '../ToggleValueTypeBtn';
import CurrencyDisplay from '../../../components/CurrencyDisplay';

interface Props {
    item: Item,
    onChange: (idx: number, key: keyof Item, value: number | string) => void,
    onToggleDiscountType: () => void,
    onDelete: () => void,
    idx: number
}

const BodyRow = ({ item, onChange, onToggleDiscountType, onDelete, idx }: Props) => {
    return (
        <tr key={idx}>
            <td>
                <input
                    className="w-full pl-2"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(idx, 'description', e.target.value)
                    }
                />
            </td>
            <td>
                <UnitInput
                    value={item.quantity}
                     onChange={
                        (value: number) => onChange(idx, 'quantity', value)
                    }
                />
            </td>
            <td>
                <CurrencyInput
                    value={item.unitPrice}
                    onChange={
                        (
                            value: number
                        ) => onChange(
                            idx, 'unitPrice', value
                        )
                    }
                />
            </td>
            <td>
                <div className="flex pr-2">
                    <CurrencyOrPercentInput
                        prefix={item.discountType === "fixed" ? "R$ " : ""}
                        suffix={item.discountType === "fixed" ? "" : " %"}
                        value={item.unitDiscount}
                        onChange={
                            (
                                value: number
                            ) => onChange(
                                idx, 'unitDiscount', value
                            )
                        }
                    />

                    <ToggleValueTypeBtn onClick={onToggleDiscountType}>
                        {item.discountType === 'fixed' ? 'R$' : '%'}
                    </ToggleValueTypeBtn>
                </div>
            </td>
            <td>
                <CurrencyDisplay value={calcItemTotalValue(item)} />
            </td>
            <td className='!border-none text-center'>
                <i className='bi bi-trash' onClick={onDelete} />
            </td>
        </tr>
    )
};

export default BodyRow;