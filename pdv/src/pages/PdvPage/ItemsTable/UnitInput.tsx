import { NumericFormat, NumberFormatValues } from "react-number-format"

interface Props {
    value: number
    onChange: (value: number) => void
}

const UnitInput = ({ value, onChange }: Props) => {
    return (
        <NumericFormat
            className="w-full text-right"
            value={value}
            allowNegative={false}
            disabled={false}
            thousandSeparator="."
            suffix={" UN"}
            decimalScale={0}
            decimalSeparator=","
            fixedDecimalScale
            onValueChange={
                (values: NumberFormatValues) => onChange(values.floatValue ?? 1)
            }
        />
    )
}

export default UnitInput