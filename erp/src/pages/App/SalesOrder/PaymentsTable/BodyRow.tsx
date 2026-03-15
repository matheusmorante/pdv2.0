import paymentMethods from "./paymentMethods";
import { PaymentsSummary, Payment } from '../../../types/payments.type'
import CurrencyInput from '../../../../components/CurrencyInput';
import ToggleValueTypeBtn from '../ToggleValueTypeBtn';
import CurrencyOrPercentInput from '../../../../components/CurrencyOrPercentInput';
import CurrencyDisplay from '../../../../components/CurrencyDisplay';
import { calcPaymentTotalValue } from '../../../utils/calculations';
import { useState } from 'react';
import { PixPaymentModal } from './PixPaymentModal';

interface Props {
    payment: Payment,
    summary: PaymentsSummary,
    onChange: (idx: number, key: keyof Payment, value: number | string) => void,
    onToggleFeeType: () => void,
    onDelete: () => void,
    idx: number
}


const BodyRow = ({ payment, summary, onChange, onToggleFeeType, onDelete, idx }: Props) => {
    const [newStatus, setNewStatus] = useState(payment.status);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);

    const onBlur = () => {
        if (payment.status === newStatus) return;

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
        <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-4 py-2">
                <select className='w-full bg-transparent border border-slate-100 dark:border-slate-800 focus:border-indigo-500 px-3 py-1.5 rounded-xl outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[140px]'
                    value={payment.method}
                    onChange={
                        (e: React.ChangeEvent<HTMLSelectElement>) =>
                            onChange(idx, 'method', e.target.value)
                    }>
                    {
                        paymentMethods.map(method => (
                            <option key={method} value={method} className="dark:bg-slate-900">{method}</option>
                        ))
                    }
                </select>

                {payment.method === 'PIX' && (
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={() => setIsPixModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                        >
                            <i className="bi bi-qr-code text-sm"></i>
                            Gerar QR Code
                        </button>

                        <PixPaymentModal
                            isOpen={isPixModalOpen}
                            onClose={() => setIsPixModalOpen(false)}
                            amount={payment.amount}
                            onSuccess={(tx) => {
                                onChange(idx, 'status', `PAGO [TID: ${tx.tid}]`);
                                setIsPixModalOpen(false);
                            }}
                        />
                    </div>
                )}
            </td>
            <td className="px-4 py-2">
                <div className="flex items-center gap-1 group/input">
                    <CurrencyInput
                        value={payment.amount}
                        onChange={
                            (value: number) => onChange(idx, 'amount', value)
                        }
                    />
                    {summary.amountRemaining > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange(idx, 'amount', payment.amount + summary.amountRemaining)}
                            className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                            title={`Puxar saldo restante (R$ ${summary.amountRemaining.toFixed(2)})`}
                        >
                            <i className="bi bi-magic" />
                        </button>
                    )}
                </div>
            </td>
            <td className='px-4 py-2'>
                <div className='flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg pr-2 border border-slate-100/50 dark:border-slate-800/50 group-focus-within:border-indigo-200 dark:group-focus-within:border-indigo-500/30 transition-all'>
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
            <td className="px-4 py-2 text-right">
                <div className="font-bold text-slate-700 dark:text-slate-200">
                    <CurrencyDisplay value={calcPaymentTotalValue(payment)} />
                </div>
            </td>
            <td className="px-4 py-2">
                <input
                    className="w-full bg-transparent border border-slate-100 dark:border-slate-800 focus:border-indigo-500 px-3 py-1.5 rounded-xl outline-none transition-all text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-200 min-w-[120px]"
                    placeholder="Status..."
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    onBlur={onBlur}
                />
            </td>
            <td className="px-4 py-2 text-center border-none">
                <button
                    type="button"
                    onClick={onDelete}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir pagamento"
                >
                    <i className="bi bi-trash" />
                </button>
            </td>
        </tr>
    )
};

export default BodyRow;