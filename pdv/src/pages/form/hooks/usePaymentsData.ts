import { PaymentsData }from "../../types/payments.type";
import { useState } from "react";

const usePaymentsData = () => {
    const [paymentsData, setPaymentsData] = useState<PaymentsData>({
        interest: 0,
        list: [{
            method: 'Verificar',
            amount: 0,
            status: ''
        }]
    });

    return { paymentsData, setPaymentsData }
}

export default usePaymentsData;