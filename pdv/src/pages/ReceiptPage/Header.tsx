import logo from '../../assets/logo.jpeg';
import { getSettings } from '../utils/settingsService';

interface Props {
    seller: string;
}

const Header = ({ seller }: Props) => {
    const settings = getSettings();
    const companyName = settings.companyName || "Móveis Morante";
    const companyCnpj = settings.companyCnpj || "44.512.248.0001/07";
    const companyAddress = settings.companyAddress || "Rua Cascavel, 306, Guaraituba, Colombo-PR, CEP 83410270.";
    const companyPhone = settings.companyPhone || "41997493547 | 41992244631";

    return (
        <header className='flex justify-between text-slate-800 transition-colors duration-300'>
            <div>
                <img src={logo} alt={`Logo ${companyName}`} className='h-[150px]' />
            </div>
            <div className='h-full flex flex-col items-end text-right'>
                <p className="font-black text-xl mb-2">{companyName}</p>
                <div className="space-y-1">
                    <p className="text-xs">
                        <strong className="text-blue-600">CNPJ: </strong>
                        {companyCnpj}
                    </p>
                    <p className="text-xs shrink-0 w-80">
                        <strong className="text-blue-600">Endereço: </strong>
                        {companyAddress}
                    </p>
                    <p className="text-xs">
                        <strong className="text-blue-600">Contato: </strong>
                        {companyPhone}
                    </p>
                    <p className="text-xs uppercase font-black tracking-widest mt-4">
                        <strong className="text-blue-600">Vendedor:</strong> {seller}
                    </p>
                </div>
            </div>
        </header>
    )
}

export default Header;