import { Payment }  from "../../types/payments.type";
import CurrencyDisplay from '../../../components/CurrencyDisplay';

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
                        <CurrencyDisplay
                            value={payment.amount}
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


export default Body;
