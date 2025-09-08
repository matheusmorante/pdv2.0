import { useEffect, useState } from "react";
import { Payment } from "./Payment.type";
import { NumericFormat } from 'react-number-format';
import { Summary } from "../types/summary.type";
import { sumKeyValues } from "../itemsTable/utils";
import AdditionalInformation from "../types/additionalInformation.type";

interface Props {
    payments: Payment[],
    summary: Summary,
    additionalInformation: AdditionalInformation
}

const TFoot = ({ payments, summary, additionalInformation }: Props) => {
    const [amountRemaining, setAmountRemaining] = useState<number>(0);
    const totalOrderValue = summary.itemsTotalValue
        + additionalInformation.freight
        + additionalInformation.fee;

    useEffect(() => {
        const totalPaid = sumKeyValues(payments, 'amount');
        setAmountRemaining(summary.itemsTotalValue - totalPaid);
    }, [payments])


    return (
        <tfoot>
            <tr>
                <td>Valor Restante</td>
                <td>Valor do Pedido</td>
            </tr>
            <tr>
                <td>
                    <NumericFormat
                        value={amountRemaining}
                        thousandSeparator="."
                        prefix={"R$ "}
                        decimalScale={2}
                        decimalSeparator=","
                        disabled={false}
                    />
                </td>
                <td>
                    <td>
                        <NumericFormat
                            value={totalOrderValue}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                            disabled={false}
                        />
                    </td>
                </td>
            </tr>
        </tfoot>
    )
}
export default TFoot;