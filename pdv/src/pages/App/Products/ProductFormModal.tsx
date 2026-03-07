import React, { useState, useEffect, useCallback } from "react";
import Product, { Variation, FiscalInfo } from "../../types/product.type";
import Person from "../../types/person.type";
import { saveProduct } from "../../utils/productService";
import { subscribeToPeople } from "../../utils/personService";
import { getSettings } from "../../utils/settingsService";
import { toast } from "react-toastify";
import { compressImage } from "../../utils/imageUtils";

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
}

const ProductFormModal = ({ isOpen, onClose, product }: ProductFormModalProps) => {
    const [activeTab, setActiveTab] = useState<'geral' | 'variacoes' | 'ecommerce' | 'estoque' | 'fiscal'>('geral');
    const [loading, setLoading] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [suppliers, setSuppliers] = useState<Person[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToPeople('suppliers', (data: Person[]) => setSuppliers(data.filter((s: Person) => !s.deleted)));
        return () => unsubscribe();
    }, []);
    
    // Default state for new product
    const initialFormData: Partial<Product> = {
        description: "",
        category: "Produtos",
        unitPrice: 0,
        costPrice: 0,
        freightCost: 0,
        ipiPercent: 0,
        finalPurchasePrice: 0,
        initialStock: 0,
        stock: 0,
        minStock: 0,
        unit: "UN",
        active: true,
        code: "",
        hasVariations: false,
        variations: [],
        images: [],
        ecommerceDescription: "",
        supplierId: "",
        itemType: 'product',
        fiscal: {
            ncm: "",
            cest: "",
            origem: "0",
            cst: "",
            cofinsCst: "",
            pisCst: "",
            cfop: "",
            icmsPercent: 0,
        }
    };

    const [formData, setFormData] = useState<Partial<Product>>(initialFormData);

    useEffect(() => {
        if (product) {
            setFormData({
                ...initialFormData,
                ...product,
                fiscal: { ...initialFormData.fiscal, ...product.fiscal }
            });
        } else {
            setFormData(initialFormData);
        }
        setActiveTab('geral');
    }, [product, isOpen]);

    // Sync variations with parent
    useEffect(() => {
        if (!formData.variations) return;
        let needsSync = false;
        const newVars = formData.variations.map(v => {
            if (v.syncWithParent && (v.unitPrice !== formData.unitPrice || v.costPrice !== formData.costPrice)) {
                needsSync = true;
                return { ...v, unitPrice: formData.unitPrice || 0, costPrice: formData.costPrice || 0 };
            }
            return v;
        });
        if (needsSync) {
            setFormData(prev => ({ ...prev, variations: newVars }));
        }
    }, [formData.unitPrice, formData.costPrice, formData.variations]);

    // Calculate final purchase price automatically
    useEffect(() => {
        const cost = formData.costPrice || 0;
        const freight = formData.freightCost || 0;
        const ipi = formData.ipiPercent || 0;
        const final = (cost + freight) * (1 + ipi / 100);
        
        if (final !== formData.finalPurchasePrice) {
            setFormData(prev => ({ ...prev, finalPurchasePrice: Number(final.toFixed(2)) }));
        }
    }, [formData.costPrice, formData.freightCost, formData.ipiPercent]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + (formData.images?.length || 0) > 15) {
            toast.error("Limite máximo de 15 fotos atingido.");
            return;
        }

        setLoading(true);
        try {
            const compressedImages: string[] = [];
            for (const file of files) {
                try {
                    const compressedBase64 = await compressImage(file, { maxMB: 0.3, maxWidth: 1920 });
                    compressedImages.push(compressedBase64);
                } catch (err) {
                    // Error toast handled in utility
                }
            }

            if (compressedImages.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...compressedImages]
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const addVariation = () => {
        const newVar: Variation = {
            id: Math.random().toString(36).substr(2, 9),
            sku: "",
            name: "Nova Variação",
            stock: 0,
            unitPrice: formData.unitPrice || 0,
            costPrice: formData.costPrice || 0,
            active: true,
            attributes: [],
            syncWithParent: true
        };
        setFormData(prev => ({
            ...prev,
            variations: [...(prev.variations || []), newVar]
        }));
    };

    const removeVariation = (id: string) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations?.filter(v => v.id !== id)
        }));
    };

    const updateVariation = (id: string, field: keyof Variation, value: any) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations?.map(v => v.id === id ? { ...v, [field]: value } : v)
        }));
    };

    const handleGenerateAIDescription = async () => {
        if (!formData.description) {
            toast.warning("Preencha a 'Descrição Comercial' na aba Cadastro Geral primeiro para eu entender do que se trata o produto.");
            setActiveTab('geral');
            return;
        }

        setIsGeneratingDescription(true);
        const loadingToast = toast.loading("🤖 A IA está redigindo uma cópia persuasiva... Isso pode levar um minuto.");

        try {
            const response = await fetch("http://localhost:3001/api/generate-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: formData.description,
                    category: formData.category,
                    unitPrice: formData.unitPrice,
                    promptTemplate: getSettings().aiPrompts.productDescription
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Erro desconhecido na IA");
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, ecommerceDescription: data.description }));
            toast.update(loadingToast, { render: "Descrição gerada com IA! ✨", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            console.error("Erro ao gerar:", error);
            toast.update(loadingToast, { render: `Erro: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description) {
            toast.error("A descrição é obrigatória.");
            return;
        }

        setLoading(true);
        try {
            await saveProduct({ ...formData, itemType: formData.itemType || 'product' } as Product);
            toast.success(product ? "Atualizado com sucesso!" : "Criado com sucesso!");
            onClose();
        } catch (error) {
            toast.error("Erro ao salvar o produto.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800 flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {product ? "Editar" : "Novo"} {formData.itemType === 'service' ? "Serviço" : "Produto"}
                        </h2>
                        <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                            {product ? `Editando ID: ${product.id}` : "Configure as informações detalhadas do item"}
                        </p>
                    </div>
                    
                    {/* Item Type Selector */}
                    {!product && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, itemType: 'product' }))}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.itemType === 'product' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <i className="bi bi-box-seam mr-2"></i> Produto
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        itemType: 'service',
                                        hasVariations: false,
                                        variations: [],
                                        stock: 0,
                                        initialStock: 0,
                                        minStock: 0,
                                        ipiPercent: 0
                                    }));
                                    if (activeTab === 'variacoes' || activeTab === 'estoque') setActiveTab('geral');
                                }}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.itemType === 'service' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <i className="bi bi-tools mr-2"></i> Serviço
                            </button>
                        </div>
                    )}

                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <i className="bi bi-x-lg text-xl"></i>
                    </button>
                </div>

                {/* Tabs Navigation */}
                <div className="px-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
                    <div className="flex gap-8">
                        {[
                            { id: 'geral', label: 'Cadastro Geral', icon: 'bi-box' },
                            ...(formData.itemType === 'product' ? [
                                { id: 'estoque', label: 'Estoque & Fornec.', icon: 'bi-graph-up-arrow' },
                                { id: 'variacoes', label: 'Variações', icon: 'bi-grid-3x3-gap' },
                            ] : []),
                            { id: 'ecommerce', label: 'E-commerce', icon: 'bi-cart-check' },
                            { id: 'fiscal', label: 'Tributário / NF', icon: 'bi-file-earmark-text' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {/* GERAL TAB */}
                    {activeTab === 'geral' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Descrição Comercial</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                    placeholder="Ex: Camiseta Algodão Egípcio Premium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:col-span-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Código (SKU Principal)</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                        placeholder="Auto-gerar se vazio"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold appearance-none dark:text-slate-100"
                                    >
                                        <option value="Produtos">📦 Produtos</option>
                                        <option value="Serviços">🛠️ Serviços</option>
                                        <option value="Insumos">🧪 Insumos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:col-span-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Preço de Venda (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-black text-blue-600 dark:text-blue-400"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Unidade de Medida</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100"
                                        placeholder="UN, KG, PC, LT..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ESTOQUE & CUSTOS TAB */}
                    {activeTab === 'estoque' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <i className="bi bi-tag text-blue-600"></i> Composição de Custo
                                    </h4>
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Preço Base de Custo</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
                                        />
                                    </div>

                                    {formData.itemType === 'product' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Frete (R$)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.freightCost}
                                                    onChange={(e) => setFormData({ ...formData, freightCost: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">IPI (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.ipiPercent}
                                                    onChange={(e) => setFormData({ ...formData, ipiPercent: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Preço de Compra Final</label>
                                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">R$ {formData.finalPurchasePrice?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <i className="bi bi-stack text-blue-600"></i> Gestão de Inventário
                                    </h4>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Quantidade Inicial</label>
                                        <input
                                            type="number"
                                            value={formData.initialStock}
                                            onChange={(e) => setFormData({ ...formData, initialStock: parseInt(e.target.value), stock: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm font-bold"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Fornecedor Padrão</label>
                                        <select
                                            value={formData.supplierId || ""}
                                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-[11px] font-bold appearance-none dark:text-slate-100"
                                        >
                                            <option value="">Nenhum fornecedor vinculado</option>
                                            {suppliers.map(sup => (
                                                <option key={sup.id} value={sup.id}>{sup.fullName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Estoque de Alerta (Mínimo)</label>
                                        <input
                                            type="number"
                                            value={formData.minStock}
                                            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:text-slate-100"
                                        />
                                    </div>

                                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">Status do Estoque Atual</label>
                                        <span className="text-xl font-black text-blue-700 dark:text-blue-300">{formData.stock || 0} {formData.unit}</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* VARIAÇÕES TAB */}
                    {activeTab === 'variacoes' && (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-4">
                                     <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.hasVariations ? 'bg-blue-600' : 'bg-slate-300'}`} onClick={() => setFormData({ ...formData, hasVariations: !formData.hasVariations })}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.hasVariations ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-blue-900 dark:text-blue-200">Habilitar Grade de Variações</h4>
                                        <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mt-0.5">Permite criar variações de cor, tamanho, etc.</p>
                                    </div>
                                </div>
                                {formData.hasVariations && (
                                    <button
                                        type="button"
                                        onClick={addVariation}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <i className="bi bi-plus-lg mr-2"></i> Adicionar Variação
                                    </button>
                                )}
                            </div>

                            {formData.hasVariations ? (
                                <div className="border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Variação</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU / Código</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sinc. Pai</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Preço Venda</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estoque</th>
                                                <th className="px-6 py-4 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {formData.variations?.map(v => (
                                                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            value={v.name}
                                                            onChange={(e) => updateVariation(v.id, 'name', e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm font-bold dark:text-slate-200"
                                                            placeholder="Ex: Azul / P"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            value={v.sku}
                                                            onChange={(e) => updateVariation(v.id, 'sku', e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm dark:text-slate-400"
                                                            placeholder="SKU-VAR-001"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${v.syncWithParent ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} onClick={() => updateVariation(v.id, 'syncWithParent', !v.syncWithParent)} title="Puxar dados do produto principal">
                                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${v.syncWithParent ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={v.unitPrice}
                                                            disabled={v.syncWithParent}
                                                            onChange={(e) => updateVariation(v.id, 'unitPrice', parseFloat(e.target.value))}
                                                            className={`w-24 bg-transparent border-none outline-none text-sm font-black ${v.syncWithParent ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}`}
                                                            title={v.syncWithParent ? "Desative sincronização para editar" : ""}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={v.stock}
                                                            onChange={(e) => updateVariation(v.id, 'stock', parseInt(e.target.value))}
                                                            className="w-16 bg-transparent border-none outline-none text-sm font-bold dark:text-slate-200"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => removeVariation(v.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {formData.variations?.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                                            <i className="bi bi-grid-3x3-gap text-4xl opacity-20"></i>
                                                            <p className="text-xs font-bold">Nenhuma variação cadastrada.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 text-center bg-slate-50/20 dark:bg-slate-900/10">
                                    <i className="bi bi-grid-3x3-gap text-6xl text-slate-100 dark:text-slate-800 mb-4 block"></i>
                                    <h3 className="text-slate-400 dark:text-slate-600 font-black uppercase text-xs tracking-widest">Produto Simples</h3>
                                    <p className="text-slate-300 dark:text-slate-700 text-[10px] mt-1 uppercase tracking-widest font-black">Habilite as variações no botão acima se este produto tiver cores, tamanhos ou modelos diferentes.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ECOMMERCE TAB */}
                    {activeTab === 'ecommerce' && (
                        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Images Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Galeria de Fotos do E-commerce</h4>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Até 15 fotos. Tamanho ideal: 50kb a 300kb (JPG/PNG)</p>
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                        {formData.images?.length || 0} / 15 Selecionadas
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {formData.images?.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-3xl overflow-hidden relative group border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                            <img src={img} className="w-full h-full object-cover" alt="Produto" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all active:scale-90 flex items-center justify-center shadow-lg"
                                            >
                                                <i className="bi bi-x-lg text-xs"></i>
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">Principal</div>
                                            )}
                                        </div>
                                    ))}
                                    {(formData.images?.length || 0) < 15 && (
                                        <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900/30 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
                                            <i className="bi bi-cloud-arrow-up text-3xl text-slate-300 group-hover:text-blue-500 dark:text-slate-700 transition-colors"></i>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 group-hover:text-blue-500">Enviar Foto</span>
                                            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Ecommerce Description */}
                            <div className="flex flex-col gap-2 relative">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Descrição Detalhada (HTML/Marketing)</label>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateAIDescription}
                                        disabled={isGeneratingDescription}
                                        className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isGeneratingDescription ? (
                                            <i className="bi bi-hourglass-split animate-spin text-sm"></i>
                                        ) : (
                                            <i className="bi bi-robot text-sm"></i>
                                        )}
                                        {isGeneratingDescription ? "Gerando..." : "Gerar com IA"}
                                    </button>
                                </div>
                                <textarea
                                    rows={8}
                                    value={formData.ecommerceDescription}
                                    onChange={(e) => setFormData({ ...formData, ecommerceDescription: e.target.value })}
                                    placeholder="Escreva a descrição persuasiva para o seu site ou marketplace. Se quiser, clique em 'Gerar com IA'!"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300 custom-scrollbar resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* FISCAL TAB */}
                    {activeTab === 'fiscal' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                                <i className="bi bi-info-circle-fill text-amber-500 text-xl mt-1"></i>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">Informações Fiscais para NF-e</h4>
                                    <p className="text-[10px] text-amber-600 uppercase font-black tracking-widest mt-0.5">Estes dados são essenciais para a emissão automática de notas fiscais.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">NCM (8 Dígitos)</label>
                                    <input
                                        type="text"
                                        value={formData.fiscal?.ncm}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, ncm: e.target.value } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm dark:text-slate-200"
                                        placeholder="0000.00.00"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CEST</label>
                                    <input
                                        type="text"
                                        value={formData.fiscal?.cest}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cest: e.target.value } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm dark:text-slate-200"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Origem da Mercadoria</label>
                                    <select
                                        value={formData.fiscal?.origem}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, origem: e.target.value } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-[11px] font-bold appearance-none dark:text-slate-200"
                                    >
                                        <option value="0">0 - Nacional</option>
                                        <option value="1">1 - Estrangeira (Importação Direta)</option>
                                        <option value="2">2 - Estrangeira (Mercado Interno)</option>
                                        <option value="3">3 - Nacional (Superior a 40% conteúdo importação)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Situação Tributária (CST/CSOSN)</label>
                                    <input
                                        type="text"
                                        value={formData.fiscal?.cst}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cst: e.target.value } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm dark:text-slate-200"
                                        placeholder="EX: 102 ou 00"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">CFOP Padrão</label>
                                    <input
                                        type="text"
                                        value={formData.fiscal?.cfop}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cfop: e.target.value } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm dark:text-slate-200"
                                        placeholder="EX: 5102"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Aliquota ICMS (%)</label>
                                    <input
                                        type="number"
                                        value={formData.fiscal?.icmsPercent}
                                        onChange={(e) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, icmsPercent: parseFloat(e.target.value) } })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm dark:text-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-between gap-3 shrink-0">
                    <div className="flex items-center">
                        <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setFormData({ ...formData, active: !formData.active })}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${formData.active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ativo</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all active:scale-95"
                        >
                            Sair sem Salvar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-blue-200 dark:shadow-none"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            <i className="bi bi-check-circle-fill"></i>
                            {product ? "Salvar Alterações" : "Concluir Cadastro"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;
