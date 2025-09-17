import CustomerData from "../types/customerData.type";
import { getShippingRouteUrl } from "./pdvUtils";

interface Props {
    customerData: CustomerData,
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>
}

const CustomerDataInputs = ({ customerData, setCustomerData }: Props) => {
    const route = getShippingRouteUrl(customerData.fullAddress)
    const onChangeCustomerData = (key: keyof CustomerData, value: string) => {
        setCustomerData((prev: CustomerData) => ({ ...prev, [key]: value }))
    }

    const onChangeAddress = (
        key: keyof CustomerData['fullAddress'],
        value: string
    ) => {
        setCustomerData((prev: CustomerData) => {
            return { ...prev, fullAddress: { ...prev.fullAddress, [key]: value } }
        })
    }

    return (
        <div> 
              <a href={route} target="_blank" className="bg-red-600 p-2 font-bold">
                <i className="bi bi-geo-alt-fill mr-2 "/> 
                 Ver Endereço no Google Maps
            </a>
        <div className="flex justify-between flex-wrap gap-4 my-6">
            
            <div className="flex flex-col">
                <label>Nome Completo</label>
                <input
                    value={customerData.fullName}
                    onChange={e => onChangeCustomerData('fullName', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Celular</label>
                <input
                value={customerData.phone}
                    onChange={e => onChangeCustomerData('phone', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Logradouro</label>
                <input
                    value={customerData.fullAddress.street}
                    onChange={e => onChangeAddress('street', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Nº</label>
                <input
                    onChange={e => onChangeAddress('number', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Complemento</label>
                <input
                    onChange={e => onChangeAddress('complement', e.target.value)}
                />
            </div>

            <div className="flex flex-col">
                <label>Bairro</label>
                <input
                    onChange={e => onChangeAddress('neighborhood', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Cidade</label>
                <input
                    onChange={e => onChangeAddress('city', e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label>Observações sobre o endereço</label>
                <input
                    onChange={e => onChangeAddress('observation', e.target.value)}
                />
            </div>
        </div>
        </div>
    )
}
export default CustomerDataInputs;