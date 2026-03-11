import Shipping from "../types/Shipping.type";
import { formatDate } from "../utils/formatters";
import { NumericFormat } from "react-number-format";

interface Props {
    shipping: Shipping
}

const ShippingData = ({ shipping }: Props) => {
    const shippingDate = shipping.scheduling.date;


    return (
        <section className='h-[100px] w-[40%]'>
            <div>
                <strong>Valor do frete: </strong>
                {shipping.value === 0 ? (
                    <span className="font-bold text-emerald-600">FRETE GRÁTIS</span>
                ) : (
                        <NumericFormat
                            value={shipping.value}
                            allowNegative={false}
                            thousandSeparator="."
                            prefix={"R$ "}
                            decimalScale={2}
                            decimalSeparator=","
                        />
                )}
            </div>
            <div>
                <strong>Data e periodo da entrega: </strong>
                {formatDate(shippingDate)} | {shipping.scheduling.time}
            </div>
        </section>
    )
}

export default ShippingData;