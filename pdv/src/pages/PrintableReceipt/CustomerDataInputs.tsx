import CustomerData from "../types/customerData.type"

interface Props {
    customerData: CustomerData 
}

const CustomerDataInputs = ({customerData}:Props) => {
    return (
        <div className="flex justify-between flex-wrap gap-4 my-12">
            <div className="flex flex-col">
                <strong>Nome Completo: </strong>
                {customerData.fullName}
            </div>
            <div className="flex flex-col">
                <strong>Celular: </strong>
                {customerData.phone}
            </div>
            <div className="flex flex-col">
                <strong>Logradouro: </strong>
                {customerData.fullAddress.street}
            </div>
            <div className="flex flex-col">
                <strong>Nº: </strong>
                {customerData.fullAddress.number}
            </div>
            <div className="flex flex-col">
                <strong>Complemento: </strong>
                {customerData.fullAddress.complement}
            </div>
            <div className="flex flex-col">
                <strong>Bairro: </strong>
                {customerData.fullAddress.neighborhood}
            </div>
            <div className="flex flex-col">
                <strong>Cidade: </strong>
                {customerData.fullAddress.city}
            </div>
        </div>
    )
}
export default CustomerDataInputs