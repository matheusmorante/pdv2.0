import { NumericFormat, NumberFormatValues } from "react-number-format"

interface Props {
    value: number
    onChange: (value: number) => void
}

const UnitInput = ({ value, onChange }: Props) => {
    return (
        <NumericFormat
            className="w-full text-right bg-transparent border-0 border-b border-transparent focus:border-blue-500 px-2 py-1.5 outline-none transition-all text-sm"
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