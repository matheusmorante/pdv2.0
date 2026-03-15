import React, { useState, useEffect } from "react";
import { Variation, ComboItem } from "../../../types/product.type";
import { toast } from "react-toastify";
import { uploadFile } from "../../../utils/storageService";
import ComboItemSelector from "./ComboItemSelector";
import SmartInput from "../../../../components/SmartInput";

interface VariationEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    variation: Variation | null;
    parentProduct?: {
        unitPrice: number;
        costPrice: number;
        isCombo?: boolean;
    };
    onSave: (updatedVariation: Variation) => void;
}

const VariationEditModal = ({ isOpen, onClose, variation, parentProduct, onSave }: VariationEditModalProps) => {
    const [localVariation, setLocalVariation] = useState<Variation | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'geral' | 'financeiro' | 'fotos' | 'combo'>('geral');

    useEffect(() => {
        if (variation) {
            setLocalVariation({ ...variation });
        } else {
            setLocalVariation(null);
        }
        setActiveTab('geral');
    }, [variation, isOpen]);

    if (!localVariation || !isOpen) return null;

    const handleChange = (field: keyof Variation, value: any) => {
        setLocalVariation(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = `variation-${Date.now()}-${file.name}`;
                const url = await uploadFile(file, fileName);
                uploadedUrls.push(url);
            }
            handleChange('images', [...(localVariation.images || []), ...uploadedUrls]);
            toast.success("Imagens enviadas!");
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
            toast.error("Falha ao enviar imagem.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        handleChange('images', localVariation.images?.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!localVariation.name.trim()) {
            toast.error("O nome da variação é obrigatório.");
            return;
        }
        onSave(localVariation);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                            <i className="bi bi-grid-3x3-gap text-blue-600" />
                            Editar Variação
                        </h3>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">
                            {localVariation.name || "Nova Variação"}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 border-b border-slate-50 dark:border-slate-800 flex gap-6 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                    {[
                        { id: 'geral', label: 'Geral', icon: 'bi-info-circle' },
                        { id: 'financeiro', label: 'Preços & Estoque', icon: 'bi-cash-stack' },
                        { id: 'fotos', label: 'Fotos', icon: 'bi-image' },
                        ...(parentProduct?.isCombo ? [{ id: 'combo', label: 'Composição', icon: 'bi-layers' }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <i className={`bi ${tab.icon}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'geral' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Variação</label>
                                    <input
                                        value={localVariation.name}
                                        onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        placeholder="EX: COR: AZUL / TAM: G"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SKU / Código</label>
                                    <input
                                        value={localVariation.sku}
                                        onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                        placeholder="SKU-VAR-001"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Sincronização com o Pai</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleChange('syncDescription', !localVariation.syncDescription)}
                                        className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all text-left ${localVariation.syncDescription ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                                    >
                                        <i className={`bi ${localVariation.syncDescription ? 'bi-link' : 'bi-link-45deg'} text-lg`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizar Título</span>
                                    </button>
                                    <button
                                        onClick={() => handleChange('active', !localVariation.active)}
                                        className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all text-left ${localVariation.active ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                                    >
                                        <i className={`bi ${localVariation.active ? 'bi-toggle-on' : 'bi-toggle-off'} text-lg`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{localVariation.active ? 'Ativo' : 'Inativo'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'financeiro' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preço de Venda</label>
                                        <button 
                                            onClick={() => handleChange('syncUnitPrice', !localVariation.syncUnitPrice)}
                                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${localVariation.syncUnitPrice ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            {localVariation.syncUnitPrice ? 'Sincronizado' : 'Manual'}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        disabled={localVariation.syncUnitPrice}
                                        value={localVariation.syncUnitPrice ? parentProduct?.unitPrice : localVariation.unitPrice}
                                        onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preço de Custo</label>
                                        <button 
                                            onClick={() => handleChange('syncCostPrice', !localVariation.syncCostPrice)}
                                            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${localVariation.syncCostPrice ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            {localVariation.syncCostPrice ? 'Sincronizado' : 'Manual'}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        disabled={localVariation.syncCostPrice}
                                        value={localVariation.syncCostPrice ? parentProduct?.costPrice : localVariation.costPrice}
                                        onChange={(e) => handleChange('costPrice', parseFloat(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estoque Atual</label>
                                    <input
                                        type="number"
                                        value={localVariation.stock}
                                        onChange={(e) => handleChange('stock', parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estoque Mínimo</label>
                                    <input
                                        type="number"
                                        value={localVariation.minStock}
                                        onChange={(e) => handleChange('minStock', parseInt(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fotos' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {localVariation.images?.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <img src={url} alt={`Var ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </div>
                                ))}
                                <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all text-slate-400">
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <i className="bi bi-plus-lg text-xl" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-center">Add Foto</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" multiple onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'combo' && parentProduct?.isCombo && (
                        <div className="space-y-6">
                            <ComboItemSelector
                                currentItems={localVariation.comboItems || []}
                                onAdd={(item) => handleChange('comboItems', [...(localVariation.comboItems || []), item])}
                                onRemove={(idx) => handleChange('comboItems', localVariation.comboItems?.filter((_, i) => i !== idx))}
                                onUpdateQuantity={(idx, qty) => {
                                    const items = [...(localVariation.comboItems || [])];
                                    items[idx].quantity = qty;
                                    handleChange('comboItems', items);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariationEditModal;
