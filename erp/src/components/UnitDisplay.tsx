import { NumericFormat as NumericFormatBase } from "react-number-format"
const NumericFormat = NumericFormatBase as any;

interface Props {
    value: number
}

const UnitDisplay = ({ value }: Props) => {


    return (
        <NumericFormat
            className="w-full text-right"
            value={value}
            allowNegative={false}
            disabled={true}
            thousandSeparator="."
            suffix={" UN"}
            decimalScale={0}
            decimalSeparator=","
            fixedDecimalScale
        />
    )
}

export default UnitDisplay