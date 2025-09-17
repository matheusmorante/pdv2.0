import { SetStateAction } from "react";
import { PaymentsSummary, PaymentsData} from "../../types/payments.type";
import InterestInput from "./InterestField";
import PaymentsTable from "./PaymentsTable/Index";

interface props {
    paymentsData: PaymentsData,
    setPaymentsData: React.Dispatch<SetStateAction<PaymentsData>>
   summary: PaymentsSummary
}
const Payments = ({ paymentsData, setPaymentsData, summary }: props) => {

    return (
        <section>
            <InterestInput
                paymentsData={paymentsData}
                setPaymentsData={setPaymentsData}
            />
            <PaymentsTable
                paymentsData={paymentsData}
                setPaymentsData={setPaymentsData}
                summary={summary}
            />

        </section>
    )
}

export default Payments

