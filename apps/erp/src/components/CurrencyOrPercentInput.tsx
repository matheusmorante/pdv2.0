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
            className="w-full min-w-[90px] text-right bg-transparent border border-slate-100 dark:border-slate-800 focus:border-blue-500 px-3 py-1 rounded-xl outline-none transition-all text-sm"
            value={value}
            allowNegative={false}
            thousandSeparator="."
            decimalScale={2}
            decimalSeparator=","
            fixedDecimalScale
            prefix={prefix}
            suffix={suffix}
            onFocus={(e) => e.target.select()}
            onValueChange={(values: NumberFormatValues) => onChange(values.floatValue ?? 0)}
        />
    )
}

export default CurrencyOrPercentInput