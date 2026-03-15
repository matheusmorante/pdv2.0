import Shipping from "../types/Shipping.type";
import { formatDate } from "../utils/formatters";
import { NumericFormat as NumericFormatBase } from "react-number-format";
const NumericFormat = NumericFormatBase as any;

interface Props {
    shipping: Shipping
}

const ShippingData = ({ shipping }: Props) => {
    const shippingDate = shipping.scheduling.date;


    return (
        <section className='flex flex-col h-[100px] gap-2 w-[30%] text-sm'>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Valor do frete: </strong>
                {shipping.value === 0 ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">FRETE GRÁTIS</span>
                ) : (
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
                )}
            </div>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Data e periodo da entrega: </strong>
                {formatDate(shippingDate)} | {shipping.scheduling.time}
            </div>
        </section>
    )
}

export default ShippingData;