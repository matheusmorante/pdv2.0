import { Payment } from '../../types/payments.type'
import paymentMethods from "./paymentMethods";
import CurrencyInput from '../../../components/CurrencyInput';
import ToggleValueTypeBtn from '../ToggleValueTypeBtn';
import CurrencyOrPercentInput from '../../../components/CurrencyOrPercentInput';
import CurrencyDisplay from '../../../components/CurrencyDisplay';
import { calcPaymentTotalValue } from '../../utils/calculations';
import { useState } from 'react';

interface Props {
    payment: Payment,
    onChange: (idx: number, key: keyof Payment, value: number | string) => void,
    onToggleFeeType: () => void,
    onDelete: () => void,
    idx: number
}


const BodyRow = ({ payment, onChange, onToggleFeeType, onDelete, idx }: Props) => {
    const [ newStatus, setNewStatus ] = useState(payment.status);
    
    const onBlur = () => {
        if(payment.status === newStatus) return;
        
        const result = window.confirm(
            `Tem certeza que quer alterar o status para "${newStatus}"`
        );
        if (result) {
            onChange(idx, 'status', newStatus)
        } else {
            setNewStatus(payment.status)
        }
    }


    return (
        <tr>
            <td>
                <select className='p-0.5 w-full'
                    value={payment.method}
                    onChange={
                        (e: React.ChangeEvent<HTMLSelectElement>) =>
                            onChange(idx, 'method', e.target.value)
                    }>
                    {
                        paymentMethods.map(method => (
                            <option value={method}>{method}</option>
                        ))
                    }
                </select>
            </td>
            <td>
                <CurrencyInput
                    value={payment.amount}
                    onChange={
                        (value: number) => onChange(idx, 'amount', value)
                    }
                />
            </td>
            <td className='pr-2'>
                <div className='flex'>
                    <CurrencyOrPercentInput
                        value={payment.fee}
                        prefix={payment.feeType === "fixed" ? "R$ " : ""}
                        suffix={payment.feeType === "fixed" ? "" : " %"}
                        onChange={
                            (
                                value: number
                            ) => onChange(
                                idx, 'fee', value
                            )

                        }
                    />
                    <ToggleValueTypeBtn onClick={onToggleFeeType}>
                        {payment.feeType === 'fixed' ? 'R$' : '%'}
                    </ToggleValueTypeBtn>
                </div>
            </td>
            <td>
                <CurrencyDisplay value={calcPaymentTotalValue(payment)} />
            </td>
            <td>
                <input
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    onBlur={onBlur}
                />
            </td>
            <td className='border-none text-center'>
                <i
                    className="bi bi-trash"
                    onClick={onDelete}
                />
            </td>
        </tr>
    )
};

export default BodyRow;