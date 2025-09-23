import CustomerData from "../types/customerData.type"

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
                <strong>Logradouro: </strong>
                {customerData.fullAddress.street}
            </div>
            <div>
                <strong>Nº: </strong>
                {customerData.fullAddress.number}
            </div>
            <div>
                <strong>Complemento: </strong>
                {customerData.fullAddress.complement}
            </div>
             <div>
                <strong>Observação Sobre o Endereço: </strong>
                {customerData.fullAddress.observation}
            </div>
            <div>
                <strong>Bairro: </strong>
                {customerData.fullAddress.neighborhood}
            </div>
            <div>
                <strong>Cidade: </strong>
                {customerData.fullAddress.city}
            </div>
        </section>
    )
}
export default CustomerDataInputs