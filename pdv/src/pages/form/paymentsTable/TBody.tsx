import React from "react";
import { currencyToNumber, convertValue } from "../../../utils/form";
import { NumericFormat } from 'react-number-format';
import PercentModeBtn from "../PercentModeBtn";
import { Payment } from "./Index";


interface Props {
    payments: Payment[];
    setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

const TBody = ({ payments, setPayments }: Props) => {
    const paymentMethods = ["Verificar", "Pix", "Dinheiro", "Cartão de Crédito 1x", "Cartão de Crédito 2x", "Cartão de Crédito 3x", "Cartão de Crédito 4x", "Cartão de Crédito 5x", "Cartão de Crédito  6x",
        "Cartão de Crédito 7x", "Cartão de Crédito 8x", "Cartão de Crédito 9x", "Cartão de Crédito 10x", "Cartão de Débito", "Crediario 1x", "Crediario 2x", "Crediario 3x",
        "Crediario 4x", "Crediario 5x", "Crediario 6x", "Crediario 7x", "Crediario 8x", "Crediario 9x", "Crediario 10x", "Crediario 11x", "Crediario 12x", "Crediario 13x",
        "Crediario 14x", "Crediario 15x", "Crediario 16x", "Crediario 17x", "Crediario 18x", "Crediario 19x", "Crediario 20x", "Crediario 21x", "Crediario 22x",
        "Crediario 23x", "Crediario 24x", "Crediario 25x", "Crediario 26x", "Crediario 27x", "Crediario 28x", "Crediario 29x", "Crediario 30x", "Crediario 31x",
        "Crediario 32x", "Crediario 33x", "Crediario 34x", "Crediario 35x", "Crediario 36x"];

    const changePayments = (idx: number, key: keyof Payment, value: string | number | boolean) => {
        const newPayments = [...payments];
        newPayments[idx] = { ...newPayments[idx], [key]: value };

        if (key === 'feeIsPercentage') {
            const paymentValue = newPayments[idx]['value'];
            const fee = newPayments[idx]['fee'];
            const feeConverted = convertValue(paymentValue, fee, value as boolean);

            newPayments[idx]['fee'] = feeConverted;
        }

        setPayments(newPayments)
    }



    return (
        <tbody>
            {payments.map((payment, idx) => (
                <tr>
                    <td>
                        <select>
                            {
                                paymentMethods.map(method => (<option value={method}>{method}</option>))
                            }
                        </select>
                    </td>
                    <td>
                        <NumericFormat
                            value={payment.value}
                            allowNegative={false}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                            onChange={
                                (e: React.ChangeEvent<HTMLInputElement>) =>
                                    changePayments(idx, 'value', currencyToNumber(e.target.value))
                            }
                        />
                    </td>
                    <td className="flex">
                        <NumericFormat
                            value={payment.fee}
                            allowNegative={false}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                            onChange={
                                (e: React.ChangeEvent<HTMLInputElement>) =>
                                    changePayments(idx, 'fee', currencyToNumber(e.target.value))
                            }
                        />
                        <PercentModeBtn action={() => changePayments(idx, 'feeIsPercentage', !payment.feeIsPercentage)}>
                            {payment.feeIsPercentage ? '%' : 'R$'}
                        </PercentModeBtn>
                    </td>
                    <td>
                        <NumericFormat
                            value={payment.paymentTotalValue}
                            allowNegative={false}
                            disabled={true}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","

                        />

                    </td>
                    <td>
                        <input value={payment.status} onChange={e => changePayments(idx, 'status', e.target.value)} /></td>
                    <td></td>
                    <td><i className="bi bi-x-lg" onClick={() => setPayments(prev => prev.filter((_, idxTarget) => idxTarget !== idx))} /></td>
                </tr>
            ))}
            <tr>
                <th>Valor restante</th>
                <td>g</td>
            </tr>
        </tbody>
    )
}


export default TBody;
