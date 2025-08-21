const PersonalInfoFields = () => {
    return (
        <div className="flex justify-between flex-wrap gap-4">
            <div className="flex flex-col">
                <label>Nome Completo</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Celular</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Logradouro</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Nº</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Complemento</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Referencia</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Bairro</label>
                <input />
            </div>
            <div className="flex flex-col">
                <label>Cidade</label>
                <input />
            </div>
        </div>
    )
}
export default PersonalInfoFields;