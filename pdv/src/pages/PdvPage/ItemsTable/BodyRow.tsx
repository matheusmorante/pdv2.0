import Item from '../../types/items.type';
import { NumericFormat } from 'react-number-format';
import { currencyToNumber } from '../pdvUtils';
import { calcItemTotalValue } from '../../utils';

interface Props {
    item: Item,
    onChange: (idx: number, key: keyof Item, value: number | string) => void,
    toggleDiscountType: (idx: number) => void,
    onDelete: () => void,
    idx: number
}

const BodyRow = ({ item, onChange, toggleDiscountType, onDelete, idx }: Props) => {
    return (
        <tr key={idx}>
            <td className=" ">
                <input
                    className="w-full"
                    value={item.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(idx, 'description', e.target.value)
                    }
                />
            </td>
            <td>
                <NumericFormat
                    className="w-full text-right"
                    value={item.quantity}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={0}
                    suffix=" un"
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(idx, 'quantity', currencyToNumber(e.target.value))
                    }
                />
            </td>
            <td>
                <NumericFormat
                    className="w-full text-right"
                    value={item.unitPrice}
                    thousandSeparator="."
                    prefix="R$ "
                    decimalScale={2}
                    decimalSeparator=","
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange(
                                idx,
                                'unitPrice',
                                currencyToNumber(e.target.value)
                            )
                    }
                />
            </td>
            <td>
                <div className="flex w-full">
                    <NumericFormat
                        className="w-[50%] text-right !rounded-r-none"
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix={
                            item.discountType === "fixed" ? "R$ " : ""
                        }
                        suffix={
                            item.discountType === "fixed" ? "" : " %"
                        }
                        decimalScale={2}
                        value={item.discount}
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                                onChange(
                                    idx,
                                    'discount',
                                    currencyToNumber(e.target.value)
                                )
                        }
                    />
                    <div className='w-[50%]'
                        onClick={() => toggleDiscountType(idx)}
                    >
                        {item.discountType === 'fixed' ? 'R$' : '%'}
                    </div>
                </div>
            </td>
            <td>
                <NumericFormat
                    className="w-full text-right"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    disabled={true}
                    value={calcItemTotalValue(item)}
                />
            </td>
            <td>
                <i className='bi bi-trash' onClick={onDelete} />
            </td>
        </tr>
    )
};

export default BodyRow;