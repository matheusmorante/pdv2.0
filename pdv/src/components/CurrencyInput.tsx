import { NumericFormat, NumberFormatValues } from "react-number-format"

interface Props {
    value: number
    onChange: (val: number) => void
}

const CurrencyInput = ({ value, onChange }: Props) => {
    return (
        <NumericFormat
            className="w-full text-right"
            value={value}
            disabled={false}
            thousandSeparator="."
            prefix={"R$ "}
            decimalScale={2}
            decimalSeparator=","
            fixedDecimalScale
            onValueChange={(values: NumberFormatValues) => {
                onChange(values.floatValue ?? 0)
            }}

        />
    )
}

export default CurrencyInput