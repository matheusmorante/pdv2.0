import Shipping from "../types/Shipping.type";
import { formatDate } from "../utils/fomatters";
import { NumericFormat } from "react-number-format";

interface Props {
    shipping: Shipping
}

const ShippingData = ({ shipping }: Props) => {
    const shippingDate = shipping.scheduling.date;


    return (
        <section className='flex flex-col h-[100px] gap-2'>
            <div>
                <strong>Valor do frete: </strong>
                <NumericFormat
                    value={shipping.value}
                    allowNegative={false}
                    thousandSeparator="."
                    prefix={"R$ "}
                    decimalScale={2}
                    decimalSeparator=","
                    disabled={true}
                />
            </div>
            <div>
                <strong>Data e periodo da entrega: </strong>
                {formatDate(shippingDate)} | {shipping.scheduling.time}
            </div>
        </section>
    )
}

export default ShippingData;