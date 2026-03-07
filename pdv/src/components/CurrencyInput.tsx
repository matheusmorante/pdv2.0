import { NumericFormat, NumberFormatValues } from "react-number-format"

interface Props {
    value: number
    onChange: (val: number) => void
}

const CurrencyInput = ({ value, onChange }: Props) => {
    return (
        <NumericFormat
            className="w-full min-w-[100px] text-right bg-transparent border-0 border-b border-transparent focus:border-blue-500 px-2 py-1.5 outline-none transition-all text-sm"
            value={value}
            disabled={false}
            allowNegative={false}
            thousandSeparator="."
            prefix={"R$ "}
            decimalScale={2}
            decimalSeparator=","
            fixedDecimalScale
            onFocus={(e) => e.target.select()}
            onValueChange={(values: NumberFormatValues) => {
                onChange(values.floatValue ?? 0)
            }}
        />
    )
}

export default CurrencyInput