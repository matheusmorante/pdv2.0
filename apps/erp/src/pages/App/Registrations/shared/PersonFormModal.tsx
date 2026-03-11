import React, { useState, useEffect, useRef } from "react";
import Person from "../../../types/person.type";
import { savePerson, isPersonRegisteredAs } from "../../../utils/personService";
import { toast } from "react-toastify";
import { capitalizePerson, toTitleCase } from "../../../utils/formatters";
import SmartInput from "../../../../components/SmartInput";
import { PatternFormat } from "react-number-format";

interface PersonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (person: Person) => void;
    person?: Person | null;
    collectionName: string;
    title: string;
}

const PersonFormModal = ({ isOpen, onClose, onSuccess, person, collectionName, title }: PersonFormModalProps) => {
    const [formData, setFormData] = useState<Partial<Person>>({
        personType: "PF",
        fullName: "",
        cpfCnpj: "",
        email: "",
        phone: "",
        active: true,
        fullAddress: {
            cep: "",
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            complement: "",
            observation: ""
        },
        marketingOrigin: "",
        position: ""
    });

    const [loading, setLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const autoSaveTimerRef = useRef<any>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (person) {
            setFormData({
                ...person,
                personType: person.personType || "PF"
            });
        } else {
            setFormData({
                personType: "PF",
                fullName: "",
                cpfCnpj: "",
                email: "",
                phone: "",
                active: true,
                fullAddress: {
                    cep: "",
                    street: "",
                    number: "",
                    neighborhood: "",
                    city: "",
                    complement: "",
                    observation: ""
                },
                marketingOrigin: "",
                position: ""
            });
        }
        isInitialMount.current = true;
    }, [person, isOpen]);

    // AUTOSAVE LOGIC
    useEffect(() => {
        if (!isOpen) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (formData.fullName && (!person || person.isDraft)) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(async () => {
                setIsSavingDraft(true);
                try {
                    const dataToSave = { ...formData, isDraft: true } as Person;
                    const savedPerson = await savePerson(collectionName, capitalizePerson(dataToSave));
                    if (savedPerson && savedPerson.id && !formData.id) {
                        setFormData(prev => ({ ...prev, id: savedPerson.id }));
                    }
                } catch (e) {
                    console.error("Erro no autosave:", e);
                } finally {
                    setIsSavingDraft(false);
                }
            }, 3000);
        }

        return () => {
             if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [formData, isOpen, person, collectionName]);

    const handleAddressChange = (field: string, value: string) => {
        setFormData((prev: Partial<Person>) => ({
            ...prev,
            fullAddress: {
                ...(prev.fullAddress as any),
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName) {
            toast.error(formData.personType === 'PJ' ? "A Razão Social é obrigatória." : "O nome é obrigatório.");
            return;
        }

        if (!formData.phone || formData.phone.trim() === '') {
            toast.error("O telefone é obrigatório.");
            return;
        }

        if (collectionName === 'customers' && !formData.marketingOrigin) {
            toast.error("Por favor, informe se o cliente é de tráfego pago.");
            return;
        }

        if (collectionName === 'employees' && !person) {
            const isRegistered = await isPersonRegisteredAs('customers', {
                cpfCnpj: formData.cpfCnpj,
                email: formData.email,
                phone: formData.phone
            });
            if (isRegistered) {
                toast.error("Clientes registrados não podem ser cadastrados como funcionários.");
                return;
            }
        }

        setLoading(true);
        try {
            const dataToSave = capitalizePerson({ ...formData, isDraft: false } as Person);
            if (dataToSave.position?.trim() === "") {
                dataToSave.position = null as any;
            }
            const savedPerson = await savePerson(collectionName, dataToSave);
            toast.success(person ? "Atualizado com sucesso!" : "Criado com sucesso!");
            if (onSuccess) onSuccess(savedPerson);
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {person ? `Editar ${title}` : `Novo ${title}`}
                        </h2>
                        <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                            {person ? `Editando ID: ${person.id}` : `Preencha as informações do novo ${title.toLowerCase()}`}
                        </p>
                    </div>
                    {isSavingDraft && (
                        <div className="ml-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
                            <i className="bi bi-cloud-arrow-up text-blue-500 animate-pulse text-xs" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Salvando rascunho...</span>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-auto">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PF/PJ Toggle */}
                        <div className="md:col-span-2 flex items-center gap-6 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tipo de Pessoa:</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, personType: 'PF' })}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.personType === 'PF' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                                >
                                    Física (PF)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, personType: 'PJ' })}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.personType === 'PJ' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                                >
                                    Jurídica (PJ)
                                </button>
                            </div>
                        </div>

                        {/* Marketing Origin (Paid Traffic) */}
                        {collectionName === 'customers' && (
                            <div className="md:col-span-2 flex items-center gap-6 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cliente por tráfego pago? <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, marketingOrigin: 'paid' })}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.marketingOrigin === 'paid' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                                    >
                                        Sim (Tráfego Pago)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, marketingOrigin: 'organic' })}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.marketingOrigin === 'organic' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                                    >
                                        Não (Loja Física)
                                    </button>
                                </div>
                            </div>
                        )}

                        {(collectionName === 'customers' || collectionName === 'employees') && (
                            <div className="md:col-span-2">
                                <SmartInput
                                    label={collectionName === 'customers' ? "Cargo ou Profissão" : "Cargo Principal"}
                                    value={formData.position || ""}
                                    onValueChange={(val) => setFormData({ ...formData, position: val })}
                                    patterns={['Vendedor', 'Gerente', 'Entregador', 'Montador', 'Auxiliar', 'Empresário', 'Autônomo', 'Aposentado']}
                                    tableName="people"
                                    columnName="position"
                                    placeholder={collectionName === 'customers' ? "Ex: Empresário, Autônomo..." : "Ex: Vendedor, Gerente..."}
                                    icon="bi-person-badge"
                                />
                            </div>
                        )}

                        <div className={`${formData.personType === 'PJ' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                            <SmartInput
                                label={formData.personType === 'PJ' ? 'Razão Social' : 'Nome Completo'}
                                required
                                value={formData.fullName}
                                onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                                tableName="people"
                                columnName="fullName"
                                placeholder={formData.personType === 'PJ' ? 'Razão Social da Empresa' : 'Nome do Cliente'}
                                icon="bi-person"
                            />
                        </div>

                        {formData.personType === 'PJ' && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nome Fantasia</label>
                                <input
                                    type="text"
                                    value={formData.tradeName || ""}
                                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="Nome Popular"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {formData.personType === 'PJ' ? 'CNPJ' : 'CPF'}
                            </label>
                            <PatternFormat
                                format={formData.personType === 'PJ' ? "##.###.###/####-##" : "###.###.###-##"}
                                type="text"
                                value={formData.cpfCnpj}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                placeholder={formData.personType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Telefone <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <PatternFormat
                                    format="(##) #####-####"
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="(00) 00000-0000"
                                />
                                <button type="button"
                                    onClick={() => {
                                        if (!formData.phone) return;
                                        const cleanPhone = formData.phone.replace(/\D/g, '');
                                        const finalPhone = cleanPhone.length >= 10 && cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
                                        window.open(`https://wa.me/${finalPhone}`, '_blank');
                                    }}
                                    title="Verificar WhatsApp"
                                    className="shrink-0 w-12 flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl transition-all shadow-sm shadow-[#25D366]/30 active:scale-95"
                                >
                                    <i className="bi bi-whatsapp text-lg"></i>
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">E-mail</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                placeholder="exemplo@email.com"
                            />
                        </div>

                        {collectionName === 'suppliers' && (
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Lead Time (Dias)</label>
                                <input
                                    type="number"
                                    value={formData.leadTime || ""}
                                    onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="Tempo de entrega estimado"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
                            <i className="bi bi-geo-alt-fill text-blue-600"></i>
                            Endereço
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CEP</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.cep}
                                    onChange={(e) => handleAddressChange("cep", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rua / Logradouro</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.street}
                                    onChange={(e) => handleAddressChange("street", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Número</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.number}
                                    onChange={(e) => handleAddressChange("number", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Bairro</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.neighborhood}
                                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Complemento</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.complement}
                                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="Opcional"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.city}
                                    onChange={(e) => handleAddressChange("city", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                />
                            </div>
                            <div className="md:col-span-3 flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Observações sobre o Endereço</label>
                                <input
                                    type="text"
                                    value={formData.fullAddress?.observation}
                                    onChange={(e) => handleAddressChange("observation", e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="Ponto de referência, etc."
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {person ? "Salvar Alterações" : `Criar ${title}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonFormModal;
