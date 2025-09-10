import { NumericFormat } from "react-number-format"
import { currencyToNumber } from "./utils"
import AdditionalInformation from "./types/additionalInformation.type"

interface Props {
    additionalInformation: AdditionalInformation,
    setAdditionalInformation: React.Dispatch<React.SetStateAction<AdditionalInformation>>
}

const AdditionalInformationInput = ({ additionalInformation, setAdditionalInformation }: Props) => {
    const onChange = (
        key: keyof AdditionalInformation,
        value: number | string | Date) => {
        setAdditionalInformation((prev: AdditionalInformation) => {
            return { ...prev, [key]: value };
        })
    }

    const onChangeDeliveryScheduling = (
        key: keyof AdditionalInformation['deliveryScheduling'],
        value: string | Date) => {
        setAdditionalInformation((prev: AdditionalInformation) => {
            return {
                ...prev, deliveryScheduling:
                    { ...prev.deliveryScheduling, [key]: value }
            };
        })
    } 

    return (
        <div className="flex w-full justify-end gap-3 mt-6 text-center">
            <div className="flex flex-col">
                <label>Vendedor</label>
                <input
                    className="text-right pr-2"
                    value={additionalInformation.seller}
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange('seller', e.target.value)
                    }
                />
            </div>
            <div className="flex flex-col">
                <label>Frete</label>
                <NumericFormat
                    className="w-20 text-right pr-2"
                    value={additionalInformation.freight}
                    allowNegative={false}
                    thousandSeparator="."
                    prefix={"R$ "}
                    decimalScale={2}
                    decimalSeparator=","
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange('freight', currencyToNumber(e.target.value))
                    }
                />
            </div>
            <div className="flex flex-col">
                <label>Juros</label>
                <NumericFormat
                    className="w-20 text-right pr-2"
                    value={additionalInformation.fee}
                    allowNegative={false}
                    thousandSeparator="."
                    prefix={"R$ "}
                    decimalScale={2}
                    decimalSeparator=","
                    onChange={
                        (e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange('fee', currencyToNumber(e.target.value))
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
                                onChangeDeliveryScheduling("date", new Date(e.target.value))
                        }
                    />

                    <input
                        className="w-full pl-2 !rounded-l-none"
                        value={additionalInformation.deliveryScheduling.time}
                        placeholder="Digite o horário/Período"
                        onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                                onChangeDeliveryScheduling("time", e.target.value)
                        }
                    />
                </div>
            </div>

        </div>
    )
}

export default AdditionalInformationInput