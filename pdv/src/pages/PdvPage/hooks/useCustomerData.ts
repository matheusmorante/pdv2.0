import { useState } from "react"
import CustomerData from "../../types/customerData.type";

export function useCustomerData() {
    const [customerData, setCustomerData] = useState<CustomerData>({
        fullName: '',
        phone: '',
        fullAddress: {
            cep: '',
            street: '',
            number: '',
            complement: '',
            observation: '',
            neighborhood: '',
            city: ''
        },

    });
    return { customerData, setCustomerData }

}

