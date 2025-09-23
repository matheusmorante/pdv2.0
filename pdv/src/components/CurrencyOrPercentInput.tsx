import { NumberFormatValues, NumericFormat } from "react-number-format"

interface Props {
    value: number
    onChange: (value: number) => void
    prefix: string,
    suffix: string
}

const CurrencyOrPercentInput = ({ value, onChange, prefix, suffix }: Props) => {
    return (
        <NumericFormat
            className="w-full text-right"
            value={value}
            thousandSeparator="."
            decimalScale={2}
            decimalSeparator=","
            fixedDecimalScale
            prefix={prefix}
            suffix={suffix}
            onValueChange={(values:NumberFormatValues) => onChange(values.floatValue ?? 0)}
        />
    )
}

export default CurrencyOrPercentInput