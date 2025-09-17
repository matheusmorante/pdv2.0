import logo from '../../assets/logo.jpeg';

const Header = () => {
    return (
        <header className='flex justify-between h-[100px]'>
            <div>
                <img src={logo} className='h-full' />
            </div>
            <div>
                <p>Móveis Morante</p>
                <p>
                    <strong>CNPJ: </strong>
                    44.512.248.0001/07
                </p>
                <p>
                    <strong>Endereço: </strong>
                    Rua Cascavel, 306, Guaraituba, Colombo-PR, CEP 83410270.
                </p>
                <p>
                    <strong>Contato: </strong>
                    41997493547 | 41992244631
                </p>
            </div>
        </header>
    )
}

export default Header;