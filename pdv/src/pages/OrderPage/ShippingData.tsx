import Shipping from "../types/Shipping.type";
import { formatDate } from "../utils/formatters";
import { NumericFormat } from "react-number-format";

interface Props {
    shipping: Shipping
}

const ShippingData = ({ shipping }: Props) => {
    const shippingDate = shipping.scheduling.date;


    return (
        <section className='flex flex-col h-[100px] gap-2 w-[30%] text-sm'>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Valor do frete: </strong>
                <NumericFormat
                    className="bg-transparent dark:text-slate-100"
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
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Data e periodo da entrega: </strong>
                {formatDate(shippingDate)} | {shipping.scheduling.time}
            </div>
        </section>
    )
}

export default ShippingData;