import React, { useEffect, useState, useRef } from "react";
import CustomerData from "../../types/customerData.type";
import Person from "../../types/person.type";
import { subscribeToPeople } from "../../utils/personService";
import { ValidationErrors } from "../../utils/validations";

interface Props {
    customerData: CustomerData;
    setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>;
    errors: ValidationErrors;
}

const CustomerDataInputs = ({ customerData, setCustomerData, errors }: Props) => {
    const [customers, setCustomers] = useState<Person[]>([]);
    const [searchTerm, setSearchTerm] = useState(customerData.fullName || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToPeople('customers', (data) => {
            const activeCustomers = data.filter(c => c.active && !c.deleted);
            setCustomers(activeCustomers);
        });
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!isDropdownOpen) {
            setSearchTerm(customerData.fullName || '');
        }
    }, [customerData.fullName, isDropdownOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelectCustomer = (customer: Person) => {
        setCustomerData({
            fullName: customer.fullName || customer.tradeName || '',
            phone: customer.phone || '',
            noPhone: customer.noPhone || false,
            fullAddress: customer.fullAddress || {
                cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', observation: ''
            }
        });
        setSearchTerm(customer.fullName || customer.tradeName || '');
        setIsDropdownOpen(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsDropdownOpen(true);

        // If they clear the input, clear the customerData
        if (e.target.value === '') {
            setCustomerData({
                fullName: '',
                phone: '',
                noPhone: false,
                fullAddress: {
                    cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', observation: ''
                }
            });
        }
    };

    const filteredCustomers = customers.filter(c => {
        const nameMatch = (c.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.tradeName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const phoneMatch = (c.phone || '').includes(searchTerm);
        return nameMatch || phoneMatch;
    });

    const isError = !!errors['customer_fullName'];

    return (
        <div className="space-y-6" ref={wrapperRef}>
            <div className="flex flex-col relative w-full group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                    Selecionar Cliente
                </label>
                <div className="relative">
                    <input
                        type="text"
                        className={`w-full bg-slate-50 dark:bg-slate-900 border px-4 py-3 rounded-2xl transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${isError
                                ? 'border-red-500 focus:border-red-600 ring-4 ring-red-500/10'
                                : 'border-slate-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                            }`}
                        placeholder="Busque pelo Nome ou Telefone..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    setCustomerData({
                                        fullName: '',
                                        phone: '',
                                        noPhone: false,
                                        fullAddress: { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', observation: '' }
                                    });
                                    setIsDropdownOpen(true);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                        <i className={`bi bi-chevron-down text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </div>
                </div>

                {isError && (
                    <div className="absolute left-0 -top-8 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                        {errors['customer_fullName']}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                    </div>
                )}

                {/* Dropdown with max height and z-index */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredCustomers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-400">
                                Nenhum cliente encontrado.
                            </div>
                        ) : (
                            filteredCustomers.map(customer => (
                                <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(customer)}
                                    className="w-full text-left p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {customer.fullName || customer.tradeName}
                                        </p>
                                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                            {customer.phone && (
                                                <span className="flex items-center gap-1">
                                                    <i className="bi bi-telephone"></i> {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {customerData.fullName === (customer.fullName || customer.tradeName) && (
                                        <i className="bi bi-check-circle-fill text-blue-500 text-lg"></i>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Visualizando Dados já preenchidos caso tenha selecionado um cliente */}
            {customerData.fullName && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 animate-fade-in space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <i className="bi bi-geo-alt-fill"></i> Dados do Endereço
                    </p>

                    {customerData.fullAddress.street ? (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                            <strong>{customerData.fullAddress.street}</strong>
                            {customerData.fullAddress.number ? `, ${customerData.fullAddress.number}` : ''}
                            {customerData.fullAddress.complement ? ` - ${customerData.fullAddress.complement}` : ''}
                            <br />
                            {customerData.fullAddress.neighborhood} - {customerData.fullAddress.city}
                            <br />
                            CEP: {customerData.fullAddress.cep || 'N/A'}
                            {customerData.fullAddress.observation && (
                                <div className="mt-2 text-xs text-amber-600 dark:text-amber-500 italic bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    Obs: {customerData.fullAddress.observation}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm italic text-slate-400">Cliente sem endereço cadastrado.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerDataInputs;
