import { NumericFormat } from 'react-number-format';
import { Payment }  from "../../types/payments.type";

interface Props {
    payments: Payment[];
}

const Body= ({ payments }: Props) => {
    return (
        <tbody>
            {payments.map((payment) => (
                <tr>
                    <td>
                        {payment.method}
                    </td>
                    <td>
                        <NumericFormat
                            className="w-full"
                            value={payment.amount}
                            allowNegative={false}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                        />
                    </td>
                    <td>
                        {payment.status}
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


export default Body;
