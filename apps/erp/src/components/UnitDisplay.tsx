import { NumericFormat } from "react-number-format"

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