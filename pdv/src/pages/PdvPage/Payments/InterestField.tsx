import { SetStateAction } from "react";
import { PaymentsData } from "../../types/payments.type"
import { currencyToNumber } from "../pdvUtils";

interface Props {
    paymentsData: PaymentsData;
    setPaymentsData: React.Dispatch<SetStateAction<PaymentsData>>;
}


const InterestField = ({ paymentsData, setPaymentsData }: Props) => {
    const changeInterest = (value: number) => {
        setPaymentsData((prev: PaymentsData) => ({ ...prev, interest: value }))
    };

    return (
        <>
            <label>Juros</label>
            <input
                value={paymentsData.interest}
                onChange={
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                        changeInterest(currencyToNumber(e.target.value))
                }
            />
        </>
    )
}

export default InterestField