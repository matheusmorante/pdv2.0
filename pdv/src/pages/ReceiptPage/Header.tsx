import logo from '../../assets/logo.jpeg';

interface Props {
    seller: string;
}

const Header = ({ seller }: Props) => {
    return (
        <header className='flex justify-between text-slate-800 dark:text-slate-100 transition-colors duration-300'>
            <div>
                <img src={logo} alt="Logo Móveis Morante" className='h-[150px] dark:brightness-90' />
            </div>
            <div className='h-full flex flex-col items-end text-right'>
                <p className="font-black text-xl mb-2">Móveis Morante</p>
                <div className="space-y-1">
                    <p className="text-xs">
                        <strong className="text-blue-600 dark:text-blue-400">CNPJ: </strong>
                        44.512.248.0001/07
                    </p>
                    <p className="text-xs">
                        <strong className="text-blue-600 dark:text-blue-400">Endereço: </strong>
                        Rua Cascavel, 306, Guaraituba, Colombo-PR, CEP 83410270.
                    </p>
                    <p className="text-xs">
                        <strong className="text-blue-600 dark:text-blue-400">Contato: </strong>
                        41997493547 | 41992244631
                    </p>
                    <p className="text-xs uppercase font-black tracking-widest mt-4">
                        <strong className="text-blue-600 dark:text-blue-400">Vendedor:</strong> {seller}
                    </p>
                </div>
            </div>
        </header>
    )
}

export default Header;