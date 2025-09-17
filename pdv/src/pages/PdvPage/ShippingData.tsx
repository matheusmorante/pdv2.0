import { NumericFormat } from "react-number-format";
import { currencyToNumber } from "./pdvUtils";
import Shipping from "../types/Shipping.type";

interface Props {
    shipping: Shipping,
    setShipping: React.Dispatch<React.SetStateAction<Shipping>>
}

const ShippingData = ({ shipping, setShipping }: Props) => {
    const onChangeShippingValue = (newValue: number) => {
        setShipping((prev: Shipping) => {
            return { ...prev, value: newValue };
        })
    };

    const onChangeScheduling = (
        key: keyof Shipping['scheduling'],
        value: string | Date) => {
        setShipping((prev: Shipping) => {
            return {
                ...prev, scheduling:
                    { ...prev.scheduling, [key]: value }
            };
        })
            
    };

    return (
        <div className="flex w-full justify-end gap-3 mt-6 text-center">
            <div className="flex flex-col">
                <label>Frete</label>
                <NumericFormat
                    className="w-20 text-right pr-2"
                    value={shipping.value}
                    allowNegative={false}
                    thousandSeparator="."
                    prefix={"R$ "}
                    decimalScale={2}
                    decimalSeparator=","
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChangeShippingValue(currencyToNumber(e.target.value))
                    }
                />
            </div>
            <div className="flex flex-col">
                <label>Agendamento da Entrega/Retirada</label>
                <div className="flex w-full text-right pr-2 ">
                    <input
                        type='date'
                        className="!rounded-r-none !bg-gray-400"
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                                onChangeScheduling("date", new Date(e.target.value))
                        }
                    />

                    <input
                        className="w-full pl-2 !rounded-l-none"
                        value={shipping.scheduling.time}
                        placeholder="Digite o horário/Período"
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                                onChangeScheduling("time", e.target.value)
                        }
                    />
                </div>
            </div>
        </div>
    )
};

export default ShippingData;