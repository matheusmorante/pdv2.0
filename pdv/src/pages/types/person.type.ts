import FullAddress from "./fullAddress.type";

export type Person = {
    id?: string;
    personType: 'PF' | 'PJ'; // Pessoa Física ou Jurídica
    fullName: string; // Nome ou Razão Social
    companyName?: string; // Razão Social (específico PJ)
    tradeName?: string; // Nome Fantasia (específico PJ)
    cpfCnpj?: string;
    email?: string;
    phone?: string;
    noPhone?: boolean;
    fullAddress?: FullAddress;
    type: 'customer' | 'supplier' | 'employee';
    active: boolean;
    leadTime?: number;
    deleted?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type PersonVisibilitySettings = {
    id: boolean;
    fullName: boolean;
    cpfCnpj: boolean;
    email: boolean;
    phone: boolean;
    address: boolean;
    actions: boolean;
};

export default Person;
