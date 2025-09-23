import logo from '../../assets/logo.jpeg';

interface Props {
  seller: string;
}

const Header = ({seller}:Props ) => {
    return (
        <header className='flex justify-between '>
            <div>
                <img src={logo} className='h-[150px]' />
            </div>
            <div className='h-full'>
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
                <p><strong>Vendedor:</strong> {seller}</p>
            </div>
        </header>
    )
}

export default Header;