import { useState } from "react";
import PercentModeBtn from "./PercentModeBtn";

type Payment = {
    value: string;
    fee: string;
    feeIsPercentage: string | boolean;
    status: string;
}
const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([{ value: "0,00", fee: "0,00", feeIsPercentage: false, status: '' }])

    const paymentMethods = ["Verificar", "Pix", "Dinheiro", "Cartão de Crédito 1x", "Cartão de Crédito 2x", "Cartão de Crédito 3x", "Cartão de Crédito 4x", "Cartão de Crédito 5x", "Cartão de Crédito  6x",
        "Cartão de Crédito 7x", "Cartão de Crédito 8x", "Cartão de Crédito 9x", "Cartão de Crédito 10x", "Cartão de Débito", "Crediario 1x", "Crediario 2x", "Crediario 3x",
        "Crediario 4x", "Crediario 5x", "Crediario 6x", "Crediario 7x", "Crediario 8x", "Crediario 9x", "Crediario 10x", "Crediario 11x", "Crediario 12x", "Crediario 13x",
        "Crediario 14x", "Crediario 15x", "Crediario 16x", "Crediario 17x", "Crediario 18x", "Crediario 19x", "Crediario 20x", "Crediario 21x", "Crediario 22x",
        "Crediario 23x", "Crediario 24x", "Crediario 25x", "Crediario 26x", "Crediario 27x", "Crediario 28x", "Crediario 29x", "Crediario 30x", "Crediario 31x",
        "Crediario 32x", "Crediario 33x", "Crediario 34x", "Crediario 35x", "Crediario 36x"];

    const addPayment = () => {
        setPayments(prev => [...prev, { value: "0,00", fee: "0,00", feeIsPercentage: false, status: '' }])
    }

    const changePayments = (idx: number, key: keyof Payment, value: string | boolean) => {
        const newPayments = [...payments];
        newPayments[idx] = { ...newPayments[idx], [key]: value };
        setPayments(newPayments)
    }

    return (
        <table>
            <thead>
                <tr className="">
                    <th>Forma de Pagamento</th>
                    <th>Valor</th>
                    <th>Juros</th>
                    <th>Status</th>
                    <th><i onClick={addPayment} className="bi bi-plus-lg" /></th>
                </tr>
            </thead>
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
                        <td><input value={payment.value} onChange={e => changePayments(idx, 'value', e.target.value)} className="text-right" /></td>
                        <td className="flex">
                            <input value={payment.fee} onChange={e => changePayments(idx, 'fee', e.target.value)} className="text-right mr-1" />
                            
                            <PercentModeBtn action={() => changePayments(idx, 'feeIsPercentage', !payment.feeIsPercentage)}>
                                {payment.feeIsPercentage ? '%' : 'R$'}
                            </PercentModeBtn>
                        </td>
                        <td><input value={payment.status} onChange={e => changePayments(idx, 'status', e.target.value)} /></td>
                        <td></td>
                        <td><i className="bi bi-x-lg" onClick={() => setPayments(prev => prev.filter((_, idxTarget) => idxTarget !== idx))} /></td>
                    </tr>
                ))}
                <tr>
                    <th>Valor restante</th>
                    <td>g</td>
                </tr>
            </tbody>
        </table>
    )
}
export default Payments;