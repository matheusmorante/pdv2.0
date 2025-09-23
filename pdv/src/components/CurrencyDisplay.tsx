import { NumericFormat } from "react-number-format"

interface Props {
    value: number
}

const CurrencyDisplay = ({ value }: Props) => {
    return (
        <NumericFormat
            className="w-full text-end"
            value={value}
            allowNegative={false}
            disabled={true}
            thousandSeparator="."
            prefix={"R$ "}
            decimalScale={2}
            decimalSeparator=","
            fixedDecimalScale
        />
    )
}

export default CurrencyDisplay