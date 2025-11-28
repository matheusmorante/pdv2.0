import CustomerData from "../types/customerData.type"
import { stringifyFullAddress } from "../utils/fomatters"

interface Props {
    customerData: CustomerData 
}

const CustomerDataInputs = ({customerData}:Props) => {
    return (
        <section className="flex flex-wrap my-6 gap-x-6 gap-y-2">
            <div>
                <strong>Nome Completo: </strong>
                {customerData.fullName}
            </div>
            <div>
                <strong>Celular: </strong>
                {customerData.phone}
            </div>
            <div>
                <strong>Endereço Completo: </strong>
                {stringifyFullAddress(customerData.fullAddress)}
            </div>
            <div>
                <strong>Observação Sobre o Endereço: </strong>
                {customerData.fullAddress.observation}
            </div>
        </section>
    )
}
export default CustomerDataInputs