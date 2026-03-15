import CustomerData from "../types/customerData.type"
import { stringifyFullAddress } from "../utils/formatters"

interface Props {
    customerData: CustomerData
}

const CustomerDataInputs = ({ customerData }: Props) => {
    return (
        <section className="flex flex-wrap my-6 gap-x-6 gap-y-2 text-sm">
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Nome Completo: </strong>
                {customerData.fullName}
            </div>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Celular: </strong>
                {customerData.phone}
            </div>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Endereço Completo: </strong>
                {stringifyFullAddress(customerData.fullAddress)}
            </div>
            <div>
                <strong className="text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-widest">Observação Sobre o Endereço: </strong>
                {customerData.fullAddress.observation}
            </div>
        </section>
    )
}
export default CustomerDataInputs