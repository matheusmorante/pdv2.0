import React from "react";
import { currencyToNumber } from "../utils";
import { NumericFormat } from 'react-number-format';
import { Payment } from "../types/Payment.type";
import paymentMethods from "./paymentMethods";

interface Props {
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

const TBody = ({ payments, setPayments }: Props) => {
   
    const changePayments = (
        idx: number,
        key: keyof Payment,
        value: string | number | boolean
    ) => {
        setPayments((prev: Payment[]) => {
            const newPayments = [...prev];
            const newPayment = { ...newPayments[idx], [key]: value };
            newPayments[idx] = newPayment;
            return newPayments
        })
    }

    return (
        <tbody>
            {payments.map((payment, idx) => (
                <tr>
                    <td>
                        <select
                            value={payment.method}
                            onChange={
                                (e: React.ChangeEvent<HTMLSelectElement>) =>
                                    changePayments(idx, 'method', e.target.value)
                            }>
                            {
                                paymentMethods.map(method => (
                                    <option value={method}>{method}</option>
                                ))
                            }
                        </select>
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
                            onChange={
                                (e: React.ChangeEvent<HTMLInputElement>) =>
                                    changePayments(idx, 'amount', currencyToNumber(e.target.value))
                            }
                        />
                    </td>
                    <td>
                        <input
                            value={payment.status}
                            onChange={e => changePayments(idx, 'status', e.target.value)}
                        />
                    </td>
                    <td>
                        <i
                            className="bi bi-trash"
                            onClick={() => setPayments(prev =>
                                prev.filter((_, idxTarget) => idxTarget !== idx))
                            }
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


export default TBody;
