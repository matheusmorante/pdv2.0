import { NumericFormat } from 'react-number-format';
import { Payment }  from "../../types/payments.type";
import CurrencyDisplay from '../../../components/CurrencyDisplay';
import { calcPaymentTotalValue } from '../../utils/calculations';

interface Props {
    payments: Payment[];
}

const Body= ({ payments }: Props) => {
    return (
        <tbody>
            {payments.map((payment) => (
                <tr>
                    <td className='pl-2'>
                        {payment.method}
                    </td>
                    <td>
                        <CurrencyDisplay value={calcPaymentTotalValue(payment)}/>
                    </td>
                    <td className='pl-2'>
                        {payment.status}
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


export default Body;
