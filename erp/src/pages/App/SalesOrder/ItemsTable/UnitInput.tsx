import { NumericFormat as NumericFormatBase, NumberFormatValues } from "react-number-format"
const NumericFormat = NumericFormatBase as any;

interface Props {
    value: number
    onChange: (value: number) => void
    disabled?: boolean
}

const UnitInput = ({ value, onChange, disabled }: Props) => {
    return (
        <NumericFormat
            className={`w-full min-w-[80px] text-right bg-transparent border border-slate-100 dark:border-slate-800 focus:border-blue-500 px-3 py-1.5 rounded-xl outline-none transition-all text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={value}
            allowNegative={false}
            disabled={disabled}
            thousandSeparator="."
            suffix={" UN"}
            decimalScale={0}
            decimalSeparator=","
            fixedDecimalScale
            onFocus={(e: any) => e.target.select()}
            onValueChange={
                (values: NumberFormatValues) => onChange(values.floatValue ?? 1)
            }
        />
    )
}

export default UnitInput