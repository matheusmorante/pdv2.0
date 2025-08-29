import { useEffect } from "react";
import { Item } from "../Index";
import { NumericFormat, PatternFormat } from 'react-number-format';

interface Props {
    items: Item[];
    freight: number;
    setFreight: React.Dispatch<React.SetStateAction<number>>;
    orderTotalValue: number;
    setOrderTotalValue: React.Dispatch<React.SetStateAction<number>>;
}


const TFoot = ({ items, freight, setFreight, orderTotalValue, setOrderTotalValue }: Props) => {

    useEffect(() => {
        const total = items.reduce((acc, item) => {
            return acc + item.itemTotalValue;
        }, 0)
        setOrderTotalValue(total)
    }, [items])


    return (
        <tfoot>
            <tr>
                <th>Frete</th>
                <th>Quantidade total</th>
                <th>Desconto Total</th>
                <th>Desconto </th>
                <th>Valor da Compra</th>
            </tr>
            <tr>

                <td>
                    <NumericFormat
                        value={freight}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                            setFreight(Number(e.target.value))
                        }
                    />
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <NumericFormat
                        value={orderTotalValue}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={false}
                    />
                </td>
            </tr>
        </tfoot>
    )
}
export default TFoot;