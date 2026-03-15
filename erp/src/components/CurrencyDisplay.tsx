import { NumericFormat as NumericFormatBase } from "react-number-format"
const NumericFormat = NumericFormatBase as any;

interface Props {
    value: number
}

const CurrencyDisplay = ({ value }: Props) => {
    return (
        <NumericFormat
            className="w-full text-end"
            value={value}
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