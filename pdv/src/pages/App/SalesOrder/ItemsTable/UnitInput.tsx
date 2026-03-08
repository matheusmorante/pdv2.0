import { NumericFormat, NumberFormatValues } from "react-number-format"

interface Props {
    value: number
    onChange: (value: number) => void
}

const UnitInput = ({ value, onChange }: Props) => {
    return (
        <NumericFormat
            className="w-full min-w-[80px] text-right bg-transparent border border-slate-100 dark:border-slate-800 focus:border-blue-500 px-3 py-1.5 rounded-xl outline-none transition-all text-sm"
            value={value}
            allowNegative={false}
            disabled={false}
            thousandSeparator="."
            suffix={" UN"}
            decimalScale={0}
            decimalSeparator=","
            fixedDecimalScale
            onFocus={(e) => e.target.select()}
            onValueChange={
                (values: NumberFormatValues) => onChange(values.floatValue ?? 1)
            }
        />
    )
}

export default UnitInput