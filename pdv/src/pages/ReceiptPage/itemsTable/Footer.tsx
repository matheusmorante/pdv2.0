import { NumericFormat } from 'react-number-format';
import { ItemsSummary } from "../../types/items.type";
import CurrencyDisplay from '../../../components/CurrencyDisplay';
import UnitDisplay from '../../../components/UnitDisplay';

interface Props {
    summary: ItemsSummary,
}

const Footer = ({summary} : Props ) => {

    return (
        <tfoot>
            <tr>
                <th className="border-none"></th>
                <th>Qt. total</th>
                <th>Subtotal</th>
                <th>Desc. Total</th>
                <th>Valor Total</th>
            </tr>
            <tr>
                <td className="border-none"></td>
                <td>
                    <UnitDisplay value={summary.totalQuantity} />
                </td>
                <td>
                    <CurrencyDisplay value={summary.itemsSubtotal}/>
                </td>
                <td>
                    <CurrencyDisplay value={summary.totalFixedDiscount}/>
                </td>
                <td>
                    <CurrencyDisplay value={summary.itemsTotalValue}/>
                </td>
            </tr>
        </tfoot>

    )
}
export default Footer;