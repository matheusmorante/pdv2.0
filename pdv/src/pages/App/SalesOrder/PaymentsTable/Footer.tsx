import { PaymentsSummary } from "../../../types/payments.type";
import CurrencyDisplay from '../../../../components/CurrencyDisplay';

interface Props {
    summary: PaymentsSummary,
}

const Footer = ({ summary }: Props) => {

    return (
        <tfoot className="border-t-2 border-slate-100">
            <tr className="bg-slate-50/30">
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Total de Taxa</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">V. T. do Pedido</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Total Pago</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Restante</th>
            </tr>
            <tr>
                <td className="px-4 py-3 text-right text-sm font-bold text-slate-600">
                    <CurrencyDisplay value={summary.totalPaymentsFee} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-black text-slate-900 bg-slate-50/50">
                    <CurrencyDisplay value={summary.totalOrderValue} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-600">
                    <CurrencyDisplay value={summary.totalAmountPaid} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">
                    <CurrencyDisplay value={summary.amountRemaining} />
                </td>
            </tr>
        </tfoot>
    )
}
export default Footer;