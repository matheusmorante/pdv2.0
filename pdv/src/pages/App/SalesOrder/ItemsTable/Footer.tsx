import { ItemsSummary } from "../../../types/items.type";
import CurrencyDisplay from '../../../../components/CurrencyDisplay';
import UnitDisplay from '../../../../components/UnitDisplay';

interface Props {
    summary: ItemsSummary,
}

const Footer = ({ summary }: Props) => {

    return (
        <tfoot className="border-t-2 border-slate-100 dark:border-slate-800">
            <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                <th className="px-4 py-2 border-none"></th>
                <th className="px-4 py-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Qt. total</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Subtotal</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Desc. Total</th>
                <th className="px-4 py-2 text-right text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Valor Total</th>
            </tr>
            <tr>
                <td className="px-4 py-3 border-none"></td>
                <td className="px-4 py-3 text-center text-sm font-bold text-slate-600 dark:text-slate-400">
                    <UnitDisplay value={summary.totalQuantity} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-slate-600 dark:text-slate-400">
                    <CurrencyDisplay value={summary.itemsSubtotal} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-orange-600 dark:text-orange-400">
                    <CurrencyDisplay value={summary.totalFixedDiscount} />
                </td>
                <td className="px-4 py-3 text-right text-sm font-black text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/20">
                    <CurrencyDisplay value={summary.itemsTotalValue} />
                </td>
            </tr>
        </tfoot>

    )
}
export default Footer;