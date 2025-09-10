
const CustomerInfo = () => {
    return (
        <div className="flex justify-between flex-wrap gap-4 my-12">
            <div className="flex flex-col">
                <strong>Nome Completo: </strong>
                
            </div>
            <div className="flex flex-col">
                <strong>Celular: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Logradouro: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Nº: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Complemento: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Referencia: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Bairro: </strong>
                <input />
            </div>
            <div className="flex flex-col">
                <strong>Cidade: </strong>
                <input />
            </div>
        </div>
    )
}
export default CustomerInfo