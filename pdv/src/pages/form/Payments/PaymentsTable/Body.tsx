import React from "react";
import { currencyToNumber } from "../../../utils";
import { NumericFormat } from 'react-number-format';
import { Payment, PaymentsData } from "../../../types/payments.type";
import paymentMethods from "./paymentMethods";

interface Props {
    paymentsData: PaymentsData;
    setPaymentsData: React.Dispatch<React.SetStateAction<PaymentsData>>;
}

const Body = ({ paymentsData, setPaymentsData }: Props) => {
   
    const changePayments = (
        idx: number,
        key: keyof Payment,
        value: string | number | boolean
    ) => {
        setPaymentsData((prev: PaymentsData) => {
            const newPaymentsData = {...prev};
            const newPayments = newPaymentsData.list;
            const newPayment = { ...newPayments[idx], [key]: value };

            newPayments[idx] = newPayment;
            newPaymentsData.list = newPayments;
            return newPaymentsData
        })
    };

    const deletePayment = (
        targetIdx: number,
    ) => {
        setPaymentsData((prev: PaymentsData) => {
            const newPaymentsData = {...prev};
            const newPayments = newPaymentsData.list;
            newPayments.filter((_, idx) => idx !== targetIdx);

            newPaymentsData.list = newPayments;
            return newPaymentsData;
        })
        
    };

    return (
        <tbody>
            {paymentsData.list.map((payment, idx) => (
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
                            onClick={() => deletePayment(idx)}
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    )
}


export default Body;
