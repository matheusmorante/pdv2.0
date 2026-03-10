import React, { useState } from "react";
import ValidatedInput from "../../../components/ValidatedInput";
import { ValidationErrors } from "../../utils/validations";
import EmployeeSearchModal from "./EmployeeSearchModal";

interface Props {
    seller: string,
    setSeller: (seller: string) => void,
    errors: ValidationErrors
}

const Seller = ({ seller, setSeller, errors }: Props) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div className="flex flex-col relative w-full">
            <ValidatedInput
                label="Vendedor Principal"
                value={seller}
                onChange={e => setSeller(e.target.value)}
                placeholder="Nome do Vendedor"
                error={errors['seller']}
                name="seller"
            />
            <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="absolute right-3 top-[34px] p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors shrink-0 flex items-center justify-center transform group"
                title="Buscar Funcionário"
            >
                <i className="bi bi-search text-sm transition-transform group-hover:scale-110" />
            </button>

            {isSearchOpen && (
                <EmployeeSearchModal 
                    onClose={() => setIsSearchOpen(false)}
                    onSelect={(name) => {
                        setSeller(name);
                    }}
                />
            )}
        </div>
    )
}

export default Seller;