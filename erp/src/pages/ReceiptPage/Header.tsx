import logo from '../../assets/logo.jpg';
import { getSettings } from '@/pages/utils/settingsService';

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
            <div className="flex items-center justify-center">
                <img src={logo} alt={`Logo ${companyName}`} className='w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-slate-100 shadow-xl object-cover' />
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
                    {settings.receiptConfig?.showSeller !== false && (
                        <p className="text-xs uppercase font-black tracking-widest mt-4">
                            <strong className="text-blue-600">Vendedor:</strong> {seller}
                        </p>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;