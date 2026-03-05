import { NumericFormat } from "react-number-format";
import { currencyToNumber } from "./pdvUtils";
import Shipping from "../types/Shipping.type";

interface Props {
    shipping: Shipping,
    setShipping: React.Dispatch<React.SetStateAction<Shipping>>
}

const ShippingData = ({ shipping, setShipping }: Props) => {
    const onChangeShippingValue = (newValue: number) => {
        setShipping((prev: Shipping) => ({ ...prev, value: newValue }));
    };

    const onChangeScheduling = (
        key: keyof Shipping["scheduling"],
        value: string | Date
    ) => {
        setShipping((prev: Shipping) => {
            const newScheduling = { ...prev.scheduling, [key]: value };

            // Sync the 'time' field for display/legacy purposes
            if (newScheduling.type === 'fixed') {
                newScheduling.time = newScheduling.startTime || '';
            } else {
                newScheduling.time = `${newScheduling.startTime || ''} às ${newScheduling.endTime || ''}`;
            }

            return {
                ...prev,
                scheduling: newScheduling as Shipping["scheduling"],
            };
        });
    };

    return (
        <div
            className="flex w-full justify-end gap-6 text-center 
            [&_input]:border-b-2 [&_input]:border-gray-300
             focus:[&_input]:border-blue-400"
        >
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onChangeShippingValue(currencyToNumber(e.target.value))
                    }
                />
            </div>
            <div className="flex flex-col flex-1 max-w-[500px]">
                <label>Agendamento da Entrega</label>
                <div className="flex items-center gap-2 mt-1">
                    <input
                        type="date"
                        className="bg-transparent"
                        value={shipping.scheduling.date}
                        onChange={(e) => onChangeScheduling("date", e.target.value)}
                    />

                    <select
                        className="border rounded p-1 text-sm"
                        value={shipping.scheduling.type || 'fixed'}
                        onChange={(e) => onChangeScheduling("type", e.target.value as any)}
                    >
                        <option value="fixed">Horário Fixo</option>
                        <option value="range">Período (Início/Fim)</option>
                    </select>

                    {shipping.scheduling.type === 'range' ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="time"
                                className="w-24 bg-transparent"
                                value={shipping.scheduling.startTime || ''}
                                onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                            />
                            <span>até</span>
                            <input
                                type="time"
                                className="w-24 bg-transparent"
                                value={shipping.scheduling.endTime || ''}
                                onChange={(e) => onChangeScheduling("endTime", e.target.value)}
                            />
                        </div>
                    ) : (
                        <input
                            type="time"
                            className="w-32 bg-transparent"
                            value={shipping.scheduling.startTime || ''}
                            onChange={(e) => onChangeScheduling("startTime", e.target.value)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShippingData;