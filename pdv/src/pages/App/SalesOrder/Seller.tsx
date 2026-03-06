import React from "react";
import ValidatedInput from "../../../components/ValidatedInput";
import { ValidationErrors } from "../../utils/validations";

interface Props {
    seller: string,
    setSeller: (seller: string) => void,
    errors: ValidationErrors
}

const Seller = ({ seller, setSeller, errors }: Props) => {
    return (
        <div className="flex flex-col">
            <ValidatedInput
                label="Vendedor"
                value={seller}
                onChange={e => setSeller(e.target.value)}
                placeholder="Nome do Vendedor"
                error={errors['seller']}
                name="seller"
            />
        </div>
    )
}

export default Seller;