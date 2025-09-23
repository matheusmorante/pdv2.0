
import Item from "../../types/items.type";
import { NumericFormat } from "react-number-format";
import { calcItemTotalValue, getFixedDiscount } from "../../utils/calculations";
import CurrencyInput from "../../../components/CurrencyInput";
import CurrencyDisplay from "../../../components/CurrencyDisplay";
import UnitDisplay from "../../../components/UnitDisplay";

interface Props {
    items: Item[];
}

const Body = ({ items }: Props) => {
    return (
        <tbody>
            {
                items.map((item, idx) => (
                    <tr key={idx}>
                        <td className="pl-2">{item.description}</td>
                        <td>
                            <UnitDisplay value={item.quantity} />
                        </td>
                        <td>
                            <CurrencyDisplay value={item.unitPrice} />
                        </td>
                        <td>
                            <CurrencyDisplay value={getFixedDiscount(item)} />
                        </td>
                        <td>
                            <CurrencyDisplay value={calcItemTotalValue(item)} />
                        </td>
                    </tr>
                ))
            }
        </ tbody>
    )
};

export default Body;
