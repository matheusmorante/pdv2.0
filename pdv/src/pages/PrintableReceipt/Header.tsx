import logo from '../assets/logo.jpeg';

const Header = () => {
    return (
        <header className='flex'>
            <div>
                <img src={logo} />
            </div>
            <div>
                <p>Móveis Morante</p>
                <p>CNPJ: 44.512.248.0001/07</p>
                <p>
                    <strong>Endereço:</strong>
                    Rua Cascavel, 306, Guaraituba, Colombo-PR, CEP 83410270.
                </p>
                <p>Contato: 41997493547 | 41992244631</p>
            </div>
        </header>
    )
}

export default Header;