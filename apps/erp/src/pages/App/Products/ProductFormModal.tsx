import React, { useState, useEffect, useCallback, useRef } from "react";
import Product, { Variation, FiscalInfo } from "../../types/product.type";
import Person from "../../types/person.type";
import { saveProduct } from "../../utils/productService";
import { subscribeToPeople } from "../../utils/personService";
import { getSettings } from "../../utils/settingsService";
import { toast } from "react-toastify";
import { compressImage } from "../../utils/imageUtils";
import { uploadFile } from "../../utils/storageService";
import { aiService } from "../../utils/aiService";
import { supabase } from "../../utils/supabaseConfig";
import SmartInput from "../../../components/SmartInput";
import ComboItemSelector from "./components/ComboItemSelector";

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null;
    initialData?: Partial<Product> | null;
    onSuccess?: (newProduct: Product) => void;
}

const VariationRow = React.memo(({ v, updateVariation, removeVariation, setFormData, isCombo, onEditCombo }: {
    v: Variation,
    updateVariation: (id: string, field: keyof Variation, value: any) => void,
    removeVariation: (id: string) => void,
    setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>,
    isCombo?: boolean,
    onEditCombo?: (id: string) => void
}) => (
    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => updateVariation(v.id, 'syncDescription', !v.syncDescription)}
                    className={`p-1 rounded-md transition-colors ${v.syncDescription ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:bg-slate-100'}`}
                    title="Herdar título do pai"
                >
                    <i className={`bi ${v.syncDescription ? 'bi-link-45deg' : 'bi-link-45deg opacity-30'}`}></i>
                </button>
                <input
                    value={v.name}
                    onChange={(e) => updateVariation(v.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm font-bold dark:text-slate-200"
                    placeholder="Ex: Azul / P"
                />
            </div>
        </td>
        <td className="px-6 py-4">
            <input
                value={v.sku}
                onChange={(e) => updateVariation(v.id, 'sku', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm dark:text-slate-400"
                placeholder="SKU-VAR-001"
            />
        </td>
        <td className="px-6 py-4 text-center">
            <button
                type="button"
                onClick={() => {
                    const allOn = v.syncUnitPrice && v.syncCostPrice && v.syncDescription;
                    const target = !allOn;
                    setFormData((prev: any) => ({
                        ...prev,
                        variations: prev.variations?.map((vi: any) => vi.id === v.id ? {
                            ...vi,
                            syncUnitPrice: target,
                            syncCostPrice: target,
                            syncDescription: target,
                            syncWithParent: target
                        } : vi)
                    }));
                }}
                className={`p-1.5 rounded-xl transition-all ${(v.syncUnitPrice && v.syncCostPrice && v.syncDescription) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                title="Sincronizar todos os campos com o pai"
            >
                <i className={`bi bi-link-45deg text-lg ${(v.syncUnitPrice && v.syncCostPrice && v.syncDescription) ? 'rotate-0' : '-rotate-45'} transition-transform`}></i>
            </button>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => updateVariation(v.id, 'syncUnitPrice', !v.syncUnitPrice)}
                    className={`p-1 rounded-md transition-colors ${v.syncUnitPrice ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:bg-slate-100'}`}
                    title="Herdar preço do pai"
                >
                    <i className={`bi ${v.syncUnitPrice ? 'bi-link-45deg' : 'bi-link-45deg opacity-30'}`}></i>
                </button>
                <input
                    type="number"
                    value={v.unitPrice}
                    disabled={v.syncUnitPrice}
                    onChange={(e) => updateVariation(v.id, 'unitPrice', parseFloat(e.target.value))}
                    className={`w-20 bg-transparent border-none outline-none text-sm font-black ${v.syncUnitPrice ? 'text-slate-400' : 'text-blue-600 dark:text-blue-400'}`}
                />
            </div>
        </td>
        <td className="px-6 py-4">
            <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariation(v.id, 'stock', parseInt(e.target.value))}
                className="w-16 bg-transparent border-none outline-none text-sm font-bold dark:text-slate-200"
            />
        </td>
        <td className="px-6 py-4">
            <input
                type="number"
                value={v.minStock || 0}
                onChange={(e) => updateVariation(v.id, 'minStock', parseInt(e.target.value))}
                className="w-16 bg-transparent border-none outline-none text-sm font-medium text-amber-600 dark:text-amber-500/80"
                placeholder="0"
            />
        </td>
        <td className="px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2">
                {isCombo && (
                    <button
                        type="button"
                        onClick={() => onEditCombo?.(v.id)}
                        className={`p-1.5 rounded-xl transition-all ${v.comboItems?.length ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-purple-600'}`}
                        title="Composição do Combo para esta variação"
                    >
                        <i className="bi bi-layers-fill text-lg"></i>
                    </button>
                )}
                <button onClick={() => removeVariation(v.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </td>
    </tr>
));

const ProductFormModal = ({ isOpen, onClose, product, initialData, onSuccess }: ProductFormModalProps) => {
    const [activeTab, setActiveTab] = useState<'geral' | 'variacoes' | 'ecommerce' | 'estoque' | 'fiscal'>('geral');
    const [loading, setLoading] = useState(false);
    const [isGeneratingEcommerce, setIsGeneratingEcommerce] = useState(false);
    const [isGeneratingWhatsapp, setIsGeneratingWhatsapp] = useState(false);
    const [isGeneratingComboName, setIsGeneratingComboName] = useState(false);
    const [isGeneratingCategory, setIsGeneratingCategory] = useState(false);
    const [activeEcommerceSubTab, setActiveEcommerceSubTab] = useState<'photos' | 'descriptions'>('photos');
    const [isBulkGeneratorOpen, setIsBulkGeneratorOpen] = useState(false);
    const [bulkAttributes, setBulkAttributes] = useState<{ name: string, values: string }[]>([
        { name: "Cor", values: "" },
        { name: "Tamanho", values: "" }
    ]);
    const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
    const [editingVariationComboId, setEditingVariationComboId] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<Person[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ id: string, name: string, parent_id?: string | null }[]>([]);

    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const autoSaveTimerRef = useRef<any>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const unsubscribe = subscribeToPeople('suppliers', (data: Person[]) => setSuppliers(data.filter((s: Person) => !s.deleted)));
        const loadCats = async () => {
            const { data } = await supabase.from('categories').select('id, name, parent_id').order('name');
            if (data) setAvailableCategories(data as any);
        };
        loadCats();
        return () => unsubscribe();
    }, []);

    // Default state for new product
    const initialFormData: Partial<Product> = {
        description: "",
        category: "Produtos",
        unitPrice: 0,
        costPrice: 0,
        freightType: 'fixed',
        freightCost: 0,
        ipiPercent: 0,
        finalPurchasePrice: 0,
        initialStock: 0,
        stock: 0,
        minStock: 0,
        unit: "UN",
        active: true,
        code: "",
        categoryIds: [],
        hasVariations: false,
        variations: [],
        images: [],
        ecommerceDescription: "",
        whatsappDescription: "",
        supplierId: "",
        itemType: 'product',
        isCombo: false,
        comboItems: [],
        line: "",
        mainDifferential: "",
        colors: "",
        notIncluded: "",
        fiscal: {
            ncm: "",
            cest: "",
            origem: "0",
            cst: "",
            cofinsCst: "",
            pisCst: "",
            cfop: "",
            icmsPercent: 0,
        },
        notificationConfig: {
            enabled: true,
            notifyZeroStock: true,
            notifyMinStock: true,
            notifyCustom: ""
        }
    };

    const [formData, setFormData] = useState<Partial<Product>>(initialFormData);

    useEffect(() => {
        if (product) {
            setFormData({
                ...initialFormData, // Start with defaults
                ...product, // Override with existing product data
                fiscal: { ...initialFormData.fiscal, ...(product.fiscal || {}) } // Merge fiscal info
            });
        } else if (initialData) {
            setFormData({
                ...initialFormData, // Start with defaults
                ...initialData, // Override with initialData
                fiscal: { ...initialFormData.fiscal, ...(initialData.fiscal || {}) } // Merge fiscal info
            });
        } else {
            setFormData(initialFormData); // Use clean initial form data
        }
        setActiveTab('geral');
        isInitialMount.current = true;
    }, [product, initialData, isOpen]);

    // AUTOSAVE LOGIC
    useEffect(() => {
        if (!isOpen) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Se for um produto novo ou já for um rascunho
        if (formData.description && (!product || product.isDraft)) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(async () => {
                setIsSavingDraft(true);
                try {
                    const savedProduct = { ...formData, itemType: formData.itemType || 'product', isDraft: true } as Product;
                    const draftId = await saveProduct(savedProduct);
                    if (draftId && !formData.id) {
                        setFormData(prev => ({ ...prev, id: draftId }));
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
    }, [formData, isOpen, product]);
    

    // Sync variations with parent
    useEffect(() => {
        if (!formData.variations) return;
        let needsSync = false;
        const newVars = formData.variations.map(v => {
            const updated = { ...v };
            let changed = false;

            if (v.syncUnitPrice && v.unitPrice !== formData.unitPrice) {
                updated.unitPrice = formData.unitPrice || 0;
                changed = true;
            }
            if (v.syncCostPrice) {
                if (v.costPrice !== formData.costPrice) {
                    updated.costPrice = formData.costPrice || 0;
                    changed = true;
                }
                if (v.freightCost !== formData.freightCost) {
                    updated.freightCost = formData.freightCost || 0;
                    changed = true;
                }
                if (v.freightType !== formData.freightType) {
                    updated.freightType = formData.freightType || 'fixed';
                    changed = true;
                }
                if (v.ipiPercent !== formData.ipiPercent) {
                    updated.ipiPercent = formData.ipiPercent || 0;
                    changed = true;
                }
            }

            if (changed) {
                needsSync = true;
                return updated;
            }
            return v;
        });
        if (needsSync) {
            setFormData(prev => ({ ...prev, variations: newVars }));
        }
    }, [formData.unitPrice, formData.costPrice, formData.freightCost, formData.freightType, formData.ipiPercent, formData.variations]);

    // Calculate final purchase price automatically
    useEffect(() => {
        const cost = formData.costPrice || 0;
        const freightVal = formData.freightCost || 0;
        const freightType = formData.freightType || 'fixed';

        let freightAmount = 0;
        if (freightType === 'percentage') {
            freightAmount = cost * (freightVal / 100);
        } else {
            freightAmount = freightVal;
        }

        const ipi = formData.ipiPercent || 0;
        const final = (cost + freightAmount) * (1 + ipi / 100);

        if (Math.abs(final - (formData.finalPurchasePrice || 0)) > 0.01) {
            setFormData(prev => ({ ...prev, finalPurchasePrice: Number(final.toFixed(2)) }));
        }
    }, [formData.costPrice, formData.freightCost, formData.freightType, formData.ipiPercent]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        if ('preventDefault' in e) e.preventDefault();

        let files: File[] = [];
        let externalUrls: string[] = [];

        if ('dataTransfer' in e) {
            // Prioridade 1: Arquivos locais
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                files = Array.from(e.dataTransfer.files);
            }
            // Prioridade 2: URLs da Web (Drop de outros sites)
            else {
                const urlList = e.dataTransfer.getData('text/uri-list');
                const htmlData = e.dataTransfer.getData('text/html');

                if (urlList) {
                    externalUrls = urlList.split('\n').filter(url => url.trim().startsWith('http') || url.trim().startsWith('data:image'));
                } else if (htmlData) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlData, 'text/html');
                    const imgs = doc.querySelectorAll('img');
                    imgs.forEach(img => {
                        if (img.src) externalUrls.push(img.src);
                    });
                }
            }
        } else if (e.target.files) {
            files = Array.from(e.target.files);
        }

        if (files.length === 0 && externalUrls.length === 0) return;

        if (files.length + externalUrls.length + (formData.images?.length || 0) > 15) {
            toast.error("Limite máximo de 15 fotos atingido.");
            return;
        }

        setLoading(true);
        try {
            const uploadedUrls: string[] = [];

            // Processar arquivos locais
            for (const file of files) {
                try {
                    const fileName = `${Date.now()}-${file.name}`;
                    const path = fileName;
                    const url = await uploadFile(file, path);
                    uploadedUrls.push(url);
                } catch (err) {
                    console.error("Error uploading image:", err);
                }
            }

            // Processar URLs da Web
            for (const url of externalUrls) {
                try {
                    const response = await fetch(`https://images.weserv.nl/?url=${encodeURIComponent(url)}`);
                    if (!response.ok) throw new Error('Falha ao baixar imagem');
                    const blob = await response.blob();

                    const contentType = blob.type || 'image/jpeg';
                    const ext = contentType.split('/')[1] || 'jpg';
                    const fileName = `web-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
                    const file = new File([blob], fileName, { type: contentType });

                    const path = fileName;
                    const uploadedUrl = await uploadFile(file, path);
                    uploadedUrls.push(uploadedUrl);
                } catch (err) {
                    console.error("Total failure capturing web image:", err);
                    toast.warning("Não foi possível capturar esta imagem da web. Salve a foto no seu computador e arraste o arquivo.");
                }
            }

            if (uploadedUrls.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), ...uploadedUrls]
                }));
                toast.success(`${uploadedUrls.length} imagem(ns) processada(s) com sucesso.`);
            }
        } finally {
            setLoading(false);
            setIsDraggingPhoto(false);
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
            freightCost: formData.freightCost || 0,
            freightType: formData.freightType || 'fixed',
            ipiPercent: formData.ipiPercent || 0,
            active: true,
            attributes: [],
            syncWithParent: true,
            syncUnitPrice: true,
            syncCostPrice: true,
            syncDescription: true
        };
        setFormData(prev => ({
            ...prev,
            variations: [...(prev.variations || []), newVar]
        }));
    };

    const generateBulkVariations = () => {
        const validAttrs = bulkAttributes.filter(a => a.name.trim() && a.values.trim());
        if (validAttrs.length === 0) {
            toast.warning("Adicione pelo menos um atributo com valores.");
            return;
        }

        const attrValues = validAttrs.map(a => ({
            name: a.name.trim(),
            values: a.values.split(',').map(v => v.trim()).filter(v => v !== "")
        }));

        // Cartesian Product logic
        const combinations: any[] = [[]];
        for (const attr of attrValues) {
            const nextCombinations: any[] = [];
            for (const combo of combinations) {
                for (const val of attr.values) {
                    nextCombinations.push([...combo, { name: attr.name, value: val }]);
                }
            }
            combinations.splice(0, combinations.length, ...nextCombinations);
        }

        const newVariations: Variation[] = combinations.map(combo => ({
            id: Math.random().toString(36).substr(2, 9),
            sku: "",
            name: combo.map((c: any) => c.value).join(' / '),
            stock: 0,
            unitPrice: formData.unitPrice || 0,
            costPrice: formData.costPrice || 0,
            freightCost: formData.freightCost || 0,
            freightType: formData.freightType || 'fixed',
            ipiPercent: formData.ipiPercent || 0,
            active: true,
            attributes: combo,
            syncWithParent: true,
            syncUnitPrice: true,
            syncCostPrice: true,
            syncDescription: true
        }));

        setFormData(prev => ({
            ...prev,
            variations: [...(prev.variations || []), ...newVariations]
        }));

        setIsBulkGeneratorOpen(false);
        toast.success(`${newVariations.length} variações geradas com sucesso!`);
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

    const handleGenerateCategory = async () => {
        if (!formData.description && !formData.ecommerceDescription) {
            toast.warning("Preencha o título ou a descrição do produto para sugerir categorias.");
            return;
        }

        setIsGeneratingCategory(true);
        try {
            const categoriesPrompt = availableCategories.map(c => `- ${c.name} (ID: ${c.id})${c.parent_id ? ' [Subcategoria]' : ''}`).join('\n');
            const prompt = `Baseado no título "${formData.description}" e na descrição "${formData.ecommerceDescription || formData.whatsappDescription || ''}", identifique as 1 a 3 categorias mais adequadas dentre as seguintes opções (RETORNE APENAS OS IDS SEPARADOS POR VÍRGULA):\n${categoriesPrompt}`;

            const response = await aiService.chat(prompt, "Sempre retorne apenas IDs separados por vírgula. Sem explicações ou saudações.");
            const suggestedIds = response.answer.split(',').map((id: string) => id.trim()).filter((id: string) => availableCategories.some(ac => ac.id === id));

            if (suggestedIds.length > 0) {
                setFormData(prev => {
                    const currentIds = prev.categoryIds || [];
                    const newIds = Array.from(new Set([...currentIds, ...suggestedIds]));
                    return { ...prev, categoryIds: newIds };
                });
                toast.success("Categorias sugeridas e adicionadas!");
            } else {
                toast.info("A IA não conseguiu identificar uma categoria correspondente clara.");
            }
        } catch (error) {
            toast.error("Erro ao sugerir categorias com IA.");
            console.error(error);
        } finally {
            setIsGeneratingCategory(false);
        }
    };

    const handleGenerateComboName = async () => {
        if (!formData.comboItems || formData.comboItems.length === 0) {
            toast.warning("Adicione itens ao combo primeiro para que a IA possa sugerir um nome.");
            return;
        }

        setIsGeneratingComboName(true);
        const loadingToast = toast.loading("🤖 Gerando um nome profissional para o seu combo...");

        try {
            const itemsList = formData.comboItems.map(i => `${i.quantity}x ${i.description}`).join(", ");
            const prompt = `Você é um especialista em marketing de móveis. Crie um NOME COMERCIAL (título) curto, profissional e atraente para um jogo/combo que contém os seguintes itens: ${itemsList}. 
            Retorne APENAS o nome gerado, sem aspas, sem explicações e sem saudações. Exemplo: Jogo de Cozinha Completa 5 Peças - Linha Premium.`;

            const data = await aiService.chat(prompt, "Sempre retorne apenas o nome do produto. Sem explicações.");
            setFormData(prev => ({ ...prev, description: data.answer.trim().replace(/^"|"$/g, '') }));
            toast.update(loadingToast, { render: "Nome do combo gerado com sucesso! ✨", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            console.error("Erro ao gerar nome do combo:", error);
            toast.update(loadingToast, { render: `Erro: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setIsGeneratingComboName(false);
        }
    };

    const handleGenerateAIDescription = async (channel: 'ecommerce' | 'whatsapp') => {
        if (!formData.description) {
            toast.warning("Preencha o 'Título do Produto' na aba Cadastro Geral primeiro.");
            setActiveTab('geral');
            return;
        }

        const isWhatsapp = channel === 'whatsapp';
        if (isWhatsapp) setIsGeneratingWhatsapp(true);
        else setIsGeneratingEcommerce(true);

        const channelLabel = isWhatsapp ? 'WhatsApp Marketplace' : 'E-commerce';
        const loadingToast = toast.loading(`🤖 Gerando cópia para ${channelLabel}... Aguarde.`);

        try {
            const settings = getSettings();
            const basePrompt = channel === 'ecommerce'
                ? (formData.ecommerceTemplate || settings.aiPrompts.ecommerceTemplate)
                : (formData.whatsappTemplate || settings.aiPrompts.whatsappTemplate);

            let finalPrompt = "";
            if (isWhatsapp) {
                finalPrompt = `Crie uma descrição seguindo este template base, preenchendo as informações do produto.
                INSTRUÇÕES IMPORTANTES: 
                1. USE APENAS TEXTO SIMPLES E EMOJIS.
                2. NÃO USE NENHUMA TAG HTML (como <b>, <ul>, etc).
                3. SUBSTITUA as tags entre colchetes ou chaves (ex: [NOME], {price}) pelos valores REAIS.

                TEMPLATE PARA SEGUIR:
                ${basePrompt || "[TÍTULO DO PRODUTO]\nPreço: [PREÇO]\n..."}

                DADOS DO PRODUTO:
                Título: ${formData.description}
                Linha/Modelo: ${formData.line || "Não informado"}
                Diferencial Principal: ${formData.mainDifferential || "Não informado"}
                Material: ${formData.material || "Não informado"}
                Cores Disponíveis: ${formData.colors || "Não informado"}
                O que NÃO acompanha: ${formData.notIncluded || "Nada consta"}
                Medidas: ${formData.width || '?'}cm (L) x ${formData.height || '?'}cm (A) x ${formData.depth || '?'}cm (P)
                ${formData.extraDimensions?.map(ed => `${ed.label}: ${ed.value}`).join('\n                ') || ''}
                Categoria: ${formData.category || "Geral"}
                Preço: R$ ${formData.unitPrice || 0}`;
            } else {
                finalPrompt = `Crie uma descrição de alto impacto para E-commerce seguindo RIGOROSAMENTE esta estrutura HTML:

                1. TÍTULO OTIMIZADO (h1): [Produto] + [Marca] + [Modelo] + [Diferencial Principal] + [Cor].
                2. TEXTO DE APRESENTAÇÃO: Um parágrafo persuasivo (copy) focado em resolver problemas e benefícios emocionais.
                3. DESTAQUES E DIFERENCIAIS: Use <ul> e <li> para listar os principais pontos fortes.
                4. FICHA TÉCNICA: Uma <table> formatada com bordas simples contendo detalhes técnicos (Medidas, Material, etc).

                REGRAS: 
                - Use apenas tags HTML básicas (<h1>, <p>, <ul>, <li>, <table>, <tr>, <td>, <b>).
                - Baseie os detalhes técnicos no TEMPLATE BASE abaixo.
                - Não inclua markdown (como \`\`\`html).

                TEMPLATE BASE / FONTE DE DADOS:
                ${basePrompt}

                DADOS DO PRODUTO:
                Título do Produto: ${formData.description}
                Linha/Modelo: ${formData.line || "Não informado"}
                Diferencial Principal: ${formData.mainDifferential || "Não informado"}
                Material: ${formData.material || "Não informado"}
                Cores Disponíveis: ${formData.colors || "Não informado"}
                O que NÃO acompanha: ${formData.notIncluded || "Nada consta"}
                Dimensões: ${formData.width || '?'}cm (L) x ${formData.height || '?'}cm (A) x ${formData.depth || '?'}cm (P)
                ${formData.extraDimensions?.map(ed => `${ed.label}: ${ed.value}`).join('\n                ') || ''}
                Categoria: ${formData.category || "Geral"}
                Preço: R$ ${formData.unitPrice || 0}`;
            }

            const data = await aiService.generateDescription({
                productName: formData.description,
                category: formData.category || "Produtos",
                unitPrice: formData.unitPrice || 0,
                promptTemplate: finalPrompt
            });

            if (isWhatsapp) {
                setFormData(prev => ({ ...prev, whatsappDescription: data.description }));
            } else {
                setFormData(prev => ({ ...prev, ecommerceDescription: data.description }));
            }
            toast.update(loadingToast, { render: `Descrição para ${channelLabel} gerada! ✨`, type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            console.error("Erro ao gerar:", error);
            toast.update(loadingToast, { render: `Erro: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            if (isWhatsapp) setIsGeneratingWhatsapp(false);
            else setIsGeneratingEcommerce(false);
        }
    };

    const handleGenerateNCM = async () => {
        if (!formData.description) {
            toast.warning("Preencha o 'Título do Produto' na aba Cadastro Geral primeiro para eu entender do que se trata o produto.");
            setActiveTab('geral');
            return;
        }

        const loadingToast = toast.loading("🤖 A IA está buscando o código NCM... Aguarde.");
        try {
            const data = await aiService.generateNCM(formData.description, formData.fiscal?.material || "");
            setFormData(prev => ({
                ...prev,
                fiscal: {
                    ...(prev.fiscal || {}),
                    ncm: data.ncm,
                    ncmDescription: data.desc
                }
            }));
            toast.update(loadingToast, { render: "NCM localizado com IA! ✨", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error: any) {
            console.error("Erro ao gerar NCM:", error);
            toast.update(loadingToast, { render: `Erro: ${error.message}`, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description) {
            toast.error("O título do produto é obrigatório.");
            return;
        }

        if (!formData.categoryIds || formData.categoryIds.length === 0) {
            toast.error("Pelo menos uma categoria deve ser selecionada.");
            setActiveTab('geral');
            return;
        }

        if (formData.itemType === 'product' && !formData.condition) {
            toast.error("A condição do móvel (Novo, Usado ou Salvado) é obrigatória para produtos.");
            setActiveTab('geral');
            return;
        }

        setLoading(true);
        try {
            const savedProduct = { ...formData, itemType: formData.itemType || 'product', isDraft: false } as Product;
            await saveProduct(savedProduct);
            toast.success(product ? "Atualizado com sucesso!" : "Criado com sucesso!");
            if (onSuccess) onSuccess(savedProduct);
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
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                {product ? 'Editar' : 'Novo'} {formData.isCombo ? 'Combo/Jogo' : formData.itemType === 'service' ? 'Serviço' : 'Produto'}
                            </h2>
                            <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">Preencha as informações abaixo</p>
                        </div>
                        {isSavingDraft && (
                            <div className="ml-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
                                <i className="bi bi-cloud-arrow-up text-blue-500 animate-pulse text-xs" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Salvando rascunho...</span>
                            </div>
                        )}
                    </div>

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
                            { id: 'ecommerce', label: 'Marketplace/Ecommerce (Informações Específicas)', icon: 'bi-cart-check' },
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
                            <div className="md:col-span-2 relative group uppercase font-black">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
                                        Título do Produto <span className="text-red-500">*</span>
                                    </label>
                                    {formData.isCombo && (
                                        <button
                                            type="button"
                                            onClick={handleGenerateComboName}
                                            disabled={isGeneratingComboName}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${isGeneratingComboName ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400'}`}
                                            title="Gerar nome atraente com IA"
                                        >
                                            {isGeneratingComboName ? (
                                                <span className="flex items-center gap-1"><i className="bi bi-hourglass-split animate-spin"></i> Gerando...</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><i className="bi bi-magic"></i> Sugerir Nome com IA</span>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <input
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
                                    placeholder={formData.isCombo ? "Ex: Jogo de Jantar Moderno 4 Cadeiras" : "Ex: Camiseta Algodão Egípcio Premium"}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:col-span-2">
                                <SmartInput
                                    label="Código (SKU Principal)"
                                    value={formData.code}
                                    onValueChange={(val) => setFormData({ ...formData, code: val })}
                                    tableName="products"
                                    columnName="code"
                                    placeholder="Ex: PROD-001"
                                    icon="bi-upc-scan"
                                />
                                <SmartInput
                                    label="Unidade de Medida"
                                    value={formData.unit || "UN"}
                                    onValueChange={(val) => setFormData({ ...formData, unit: val.toUpperCase() })}
                                    patterns={["UN", "KG", "M", "CX", "PC", "PAR", "L"]}
                                    tableName="products"
                                    columnName="unit"
                                    placeholder="Ex: UN, KG, M..."
                                    icon="bi-box-seam"
                                />
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Categorias associadas <span className="text-red-500">*</span></label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateCategory}
                                            disabled={isGeneratingCategory}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${isGeneratingCategory ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'}`}
                                            title="Sugerir categorias com IA"
                                        >
                                            {isGeneratingCategory ? (
                                                <span className="flex items-center gap-1"><i className="bi bi-hourglass-split animate-spin"></i> Analisando...</span>
                                            ) : (
                                                <span className="flex items-center gap-1"><i className="bi bi-magic"></i> Sugerir com IA</span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/50">
                                        {(() => {
                                            const parents = availableCategories.filter(c => !c.parent_id);
                                            if (availableCategories.length === 0) return <span className="text-[10px] text-slate-400 p-2 font-bold uppercase tracking-widest">Nenhuma categoria cadastrada.</span>;

                                            return parents.map(parent => (
                                                <React.Fragment key={parent.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => {
                                                                const ids = prev.categoryIds || [];
                                                                if (ids.includes(parent.id)) {
                                                                    return { ...prev, categoryIds: ids.filter(i => i !== parent.id) };
                                                                } else {
                                                                    return { ...prev, categoryIds: [...ids, parent.id] };
                                                                }
                                                            });
                                                        }}
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${formData.categoryIds?.includes(parent.id) ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300 dark:text-slate-300'}`}
                                                    >
                                                        {parent.name}
                                                    </button>
                                                    {availableCategories.filter(c => c.parent_id === parent.id).map(child => (
                                                        <button
                                                            key={child.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => {
                                                                    const ids = prev.categoryIds || [];
                                                                    let nextIds = ids.includes(child.id) ? ids.filter(i => i !== child.id) : [...ids, child.id];
                                                                    if (!ids.includes(child.id) && !nextIds.includes(parent.id)) {
                                                                        nextIds = [...nextIds, parent.id];
                                                                    }
                                                                    return { ...prev, categoryIds: nextIds };
                                                                });
                                                            }}
                                                            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-all ${formData.categoryIds?.includes(child.id) ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/30 text-blue-500/70 hover:border-blue-400 dark:text-blue-400/60'} flex items-center gap-1.5`}
                                                        >
                                                            <i className="bi bi-arrow-return-right text-[8px] opacity-70"></i>
                                                            {child.name}
                                                        </button>
                                                    ))}
                                                </React.Fragment>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* Condição do Móvel */}
                                {formData.itemType === 'product' && (
                                    <div className="flex flex-col gap-2 md:col-span-2 mt-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Condição do Produto <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-4">
                                            {[
                                                { value: 'novo', label: 'Novo', icon: 'bi-box-seam' },
                                                { value: 'usado', label: 'Usado', icon: 'bi-recycle' },
                                                { value: 'salvado', label: 'Salvado (Avariado)', icon: 'bi-exclamation-triangle' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, condition: opt.value as any }))}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all ${formData.condition === opt.value ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                                >
                                                    <i className={`bi ${opt.icon}`}></i> {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Preço de Venda (R$)</label>
                                    {formData.isCombo && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const total = formData.comboItems?.reduce((acc: number, item) => acc + ((item.unitPrice || 0) * item.quantity), 0) || 0;
                                                setFormData({ ...formData, unitPrice: Number(total.toFixed(2)) });
                                                toast.info(`Preço calculado: R$ ${total.toFixed(2)}`);
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                        >
                                            <i className="bi bi-calculator"></i> Somar Itens do Combo
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-black text-blue-600 dark:text-blue-400"
                                />
                            </div>

                            {/* Section: Technical Details (Furniture) */}
                            <div className="md:col-span-2 mt-4 bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <i className="bi bi-rulers text-blue-600"></i> Detalhes Técnicos / Dimensões
                                    </h4>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Essas informações enriquecem a descrição gerada pela IA</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Material selection */}
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material do Móvel</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['MDP', 'MDF', 'MDP/MDF', 'Mad. Maciça', 'Metal/MDP', 'Metal', 'Outro'].map(mat => (
                                                <button
                                                    key={mat}
                                                    type="button"
                                                    onClick={() => {
                                                        if (mat === 'Outro') {
                                                            setFormData({ ...formData, material: '' }); // Clear to let user type
                                                        } else {
                                                            setFormData({ ...formData, material: mat });
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${((mat !== 'Outro' && formData.material === mat) || (mat === 'Outro' && !['MDP', 'MDF', 'MDP/MDF', 'Mad. Maciça', 'Metal/MDP', 'Metal'].includes(formData.material || ''))) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-blue-300'}`}
                                                >
                                                    {mat}
                                                </button>
                                            ))}
                                        </div>
                                        {(!['MDP', 'MDF', 'MDP/MDF', 'Mad. Maciça', 'Metal/MDP', 'Metal'].includes(formData.material || '') || formData.material === '') && (
                                            <input
                                                value={formData.material || ''}
                                                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                                placeholder="Digite o material personalizado..."
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold"
                                            />
                                        )}
                                    </div>

                                    {/* Magalu Refinement Fields */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="md:col-span-2">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                                                <i className="bi bi-magic"></i> Refinamento para IA (Estilo Magalu)
                                            </h5>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Linha ou Modelo</label>
                                            <input
                                                value={formData.line || ''}
                                                onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                                                placeholder="Ex: Linha Premium Lux"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Diferencial Principal (Copy)</label>
                                            <input
                                                value={formData.mainDifferential || ''}
                                                onChange={(e) => setFormData({ ...formData, mainDifferential: e.target.value })}
                                                placeholder="Ex: Dobradiças com amortecimento"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cores Disponíveis</label>
                                            <input
                                                value={formData.colors || ''}
                                                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                                                placeholder="Ex: Off White / Castanho"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">O que NÃO acompanha</label>
                                            <input
                                                value={formData.notIncluded || ''}
                                                onChange={(e) => setFormData({ ...formData, notIncluded: e.target.value })}
                                                placeholder="Ex: Tampo, pia e eletros"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dimensões Totais (cm)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Largura</span>
                                                <input
                                                    type="number"
                                                    value={formData.width || ''}
                                                    onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                                                    placeholder="L"
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-center"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Altura</span>
                                                <input
                                                    type="number"
                                                    value={formData.height || ''}
                                                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                                    placeholder="A"
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-center"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Profund.</span>
                                                <input
                                                    type="number"
                                                    value={formData.depth || ''}
                                                    onChange={(e) => setFormData({ ...formData, depth: parseFloat(e.target.value) })}
                                                    placeholder="P"
                                                    className="w-full px-3 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Dimensions List */}
                                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medições Adicionais (Máx. 10)</label>
                                            <p className="text-[9px] text-slate-400 italic">Ex: "Altura até o assento", "80cm"</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if ((formData.extraDimensions?.length || 0) >= 10) {
                                                    toast.warning("Limite de 10 medições extras atingido.");
                                                    return;
                                                }
                                                setFormData({ ...formData, extraDimensions: [...(formData.extraDimensions || []), { label: '', value: '' }] });
                                            }}
                                            className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors"
                                        >
                                            <i className="bi bi-plus-lg mr-1"></i> Adicionar Medição
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {formData.extraDimensions?.map((ed, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-3 items-end animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">O que está medindo?</span>
                                                    <input
                                                        value={ed.label}
                                                        onChange={(e) => {
                                                            const newEds = [...(formData.extraDimensions || [])];
                                                            newEds[idx].label = e.target.value;
                                                            setFormData({ ...formData, extraDimensions: newEds });
                                                        }}
                                                        placeholder="Ex: Altura até o assento"
                                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Valor</span>
                                                    <input
                                                        value={ed.value}
                                                        onChange={(e) => {
                                                            const newEds = [...(formData.extraDimensions || [])];
                                                            newEds[idx].value = e.target.value;
                                                            setFormData({ ...formData, extraDimensions: newEds });
                                                        }}
                                                        placeholder="Ex: 80cm"
                                                        className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium text-center"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newEds = formData.extraDimensions?.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, extraDimensions: newEds });
                                                    }}
                                                    className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                        {(formData.extraDimensions?.length || 0) === 0 && (
                                            <p className="text-[10px] text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                                Nenhuma medição extra adicionada. Clique em "Adicionar Medição" para enriquecer a descrição.
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 italic">Use para detalhes extras como "Profundidade esticado", "Altura do braço", etc.</p>
                                </div>
                            </div>

                            {/* Combo Items Section */}
                            {formData.isCombo && (
                                <div className="md:col-span-2 bg-purple-50/30 dark:bg-purple-900/5 p-6 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/20 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-purple-800 dark:text-purple-200 flex items-center gap-2">
                                            <i className="bi bi-layers-fill"></i> Composição do Combo
                                        </h4>
                                        <p className="text-[9px] text-purple-600 uppercase font-black tracking-widest italic">O estoque do combo será calculado automaticamente.</p>
                                    </div>

                                    <ComboItemSelector
                                        currentItems={formData.comboItems || []}
                                        onAdd={(newItem) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                comboItems: [...(prev.comboItems || []), newItem]
                                            }));
                                        }}
                                        onRemove={(idx) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                comboItems: prev.comboItems?.filter((_, i) => i !== idx)
                                            }));
                                        }}
                                        onUpdateQuantity={(idx, qty) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                comboItems: prev.comboItems?.map((item, i) => i === idx ? { ...item, quantity: qty } : item)
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ESTOQUE & CUSTOS TAB */}
                    {activeTab === 'estoque' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                        Frete ({formData.freightType === 'percentage' ? '%' : 'R$'})
                                                    </label>
                                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg gap-0.5 scale-75 origin-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, freightType: 'fixed' })}
                                                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${formData.freightType === 'fixed' || !formData.freightType ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                                        >
                                                            $
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, freightType: 'percentage' })}
                                                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition-all ${formData.freightType === 'percentage' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                                        >
                                                            %
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.freightCost}
                                                    onChange={(e) => setFormData({ ...formData, freightCost: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm"
                                                    placeholder={formData.freightType === 'percentage' ? "0.00 %" : "0.00"}
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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
                                            {formData.isCombo ? "Estoque Calculado (Mínimo dos Itens)" : "Status do Estoque Atual"}
                                        </label>
                                        <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                                            {formData.isCombo
                                                ? (formData.comboItems?.length
                                                    ? Math.min(...formData.comboItems.map((i: any) => Math.floor((i.stock || 0) / i.quantity)))
                                                    : 0)
                                                : (formData.stock || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Notification Configuration */}
                                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex flex-col gap-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200/50 dark:shadow-amber-900/30">
                                            <i className="bi bi-bell-fill text-white text-sm" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Configuração de Notificações</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                Defina quais alertas este produto deve gerar no sistema.
                                                {formData.condition === 'salvado' && (
                                                    <span className="ml-1 font-black text-amber-600 dark:text-amber-400">
                                                        (Produto salvado — sem alertas por padrão)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Master toggle */}
                                    <div
                                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer group"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            notificationConfig: {
                                                enabled: !(prev.notificationConfig?.enabled ?? true),
                                                notifyZeroStock: prev.notificationConfig?.notifyZeroStock ?? true,
                                                notifyMinStock: prev.notificationConfig?.notifyMinStock ?? true,
                                                notifyCustom: prev.notificationConfig?.notifyCustom
                                            }
                                        }))}
                                    >
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-100">Notificações Ativadas</p>
                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Habilitar ou desabilitar todos os alertas deste produto</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-all group-hover:ring-2 group-hover:ring-amber-300 dark:group-hover:ring-amber-700 ${(formData.notificationConfig?.enabled ?? true) ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${(formData.notificationConfig?.enabled ?? true) ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>

                                    {/* Individual toggles */}
                                    {(formData.notificationConfig?.enabled ?? true) && (
                                        <div className="flex flex-col gap-3">
                                            {/* Notify Zero Stock */}
                                            <div
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer group"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    notificationConfig: {
                                                        enabled: prev.notificationConfig?.enabled ?? true,
                                                        notifyZeroStock: !(prev.notificationConfig?.notifyZeroStock ?? true),
                                                        notifyMinStock: prev.notificationConfig?.notifyMinStock ?? true,
                                                        notifyCustom: prev.notificationConfig?.notifyCustom
                                                    }
                                                }))}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="bi bi-exclamation-octagon-fill text-red-500 text-lg" />
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">Alerta de Estoque Zerado</p>
                                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Notificar quando estoque chegar a 0</p>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full p-1 transition-all group-hover:ring-2 group-hover:ring-red-200 dark:group-hover:ring-red-900 ${(formData.notificationConfig?.notifyZeroStock ?? true) ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${(formData.notificationConfig?.notifyZeroStock ?? true) ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>

                                            {/* Notify Min Stock */}
                                            <div
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer group"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    notificationConfig: {
                                                        enabled: prev.notificationConfig?.enabled ?? true,
                                                        notifyZeroStock: prev.notificationConfig?.notifyZeroStock ?? true,
                                                        notifyMinStock: !(prev.notificationConfig?.notifyMinStock ?? true),
                                                        notifyCustom: prev.notificationConfig?.notifyCustom
                                                    }
                                                }))}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="bi bi-exclamation-triangle-fill text-amber-500 text-lg" />
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">Alerta de Estoque Mínimo</p>
                                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                            Notificar quando atingir o limite mínimo
                                                            {(formData.minStock || 0) > 0 ? ` (atual: ${formData.minStock} ${formData.unit || 'un'})` : ' (defina o estoque mínimo acima)'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full p-1 transition-all group-hover:ring-2 group-hover:ring-amber-200 dark:group-hover:ring-amber-900 ${(formData.notificationConfig?.notifyMinStock ?? true) ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${(formData.notificationConfig?.notifyMinStock ?? true) ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>

                                            {/* Custom note */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                                    <i className="bi bi-chat-left-text text-slate-400" />
                                                    Nota interna sobre este produto (opcional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.notificationConfig?.notifyCustom || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        notificationConfig: {
                                                            enabled: prev.notificationConfig?.enabled ?? true,
                                                            notifyZeroStock: prev.notificationConfig?.notifyZeroStock ?? true,
                                                            notifyMinStock: prev.notificationConfig?.notifyMinStock ?? true,
                                                            notifyCustom: e.target.value
                                                        }
                                                    }))}
                                                    placeholder="Ex: Produto sazonal. Verificar com fornecedor antes de repor."
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400/70"
                                                />
                                            </div>
                                        </div>
                                    )}
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
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsBulkGeneratorOpen(true)}
                                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700"
                                        >
                                            <i className="bi bi-grid-3x3-gap mr-2"></i> Gerar em Lote
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addVariation}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30"
                                        >
                                            <i className="bi bi-plus-lg mr-2"></i> Adicionar Variação
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Bulk Generator Panel */}
                            {isBulkGeneratorOpen && (
                                <div className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-900/30 animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Gerador Automático de Grade</h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Defina os atributos e separe os valores por vírgula para gerar todas as combinações.</p>
                                        </div>
                                        <button onClick={() => setIsBulkGeneratorOpen(false)} className="text-slate-400 hover:text-red-500"><i className="bi bi-x-lg"></i></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {bulkAttributes.map((attr, idx) => (
                                            <div key={idx} className="flex gap-2 items-start bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <div className="flex-1 flex flex-col gap-2">
                                                    <input
                                                        placeholder="Ex: Cor"
                                                        value={attr.name}
                                                        onChange={(e) => {
                                                            const newAttrs = [...bulkAttributes];
                                                            newAttrs[idx].name = e.target.value;
                                                            setBulkAttributes(newAttrs);
                                                        }}
                                                        className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 pb-1 border-b border-slate-50 dark:border-slate-800 mb-1"
                                                    />
                                                    <textarea
                                                        placeholder="Ex: Azul, Marrom, Preto"
                                                        value={attr.values}
                                                        onChange={(e) => {
                                                            const newAttrs = [...bulkAttributes];
                                                            newAttrs[idx].values = e.target.value;
                                                            setBulkAttributes(newAttrs);
                                                        }}
                                                        rows={2}
                                                        className="w-full bg-transparent border-none outline-none text-sm font-bold dark:text-slate-200 resize-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setBulkAttributes(bulkAttributes.filter((_, i) => i !== idx))}
                                                    className="p-2 text-slate-300 hover:text-red-500"
                                                >
                                                    <i className="bi bi-trash3 text-xs"></i>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setBulkAttributes([...bulkAttributes, { name: "", values: "" }])}
                                            className="h-full min-h-[80px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-400 hover:text-blue-600 transition-all group"
                                        >
                                            <i className="bi bi-plus-circle text-xl group-hover:scale-110 transition-transform"></i>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Novo Atributo</span>
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsBulkGeneratorOpen(false)}
                                            className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generateBulkVariations}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            Gerar Variações
                                        </button>
                                    </div>
                                </div>
                            )}

                            {formData.hasVariations ? (
                                <div className="border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Variação</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">SKU / Código</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Sinc. Tudo</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">R$ Venda</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estoque</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Mín.</th>
                                                <th className="px-6 py-4 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {formData.variations?.map(v => (
                                                <VariationRow
                                                    key={v.id}
                                                    v={v}
                                                    updateVariation={updateVariation}
                                                    removeVariation={removeVariation}
                                                    setFormData={setFormData}
                                                    isCombo={formData.isCombo}
                                                    onEditCombo={setEditingVariationComboId}
                                                />
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

                            {/* Modal de Composição da Variação (Combo) */}
                            {editingVariationComboId && (
                                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setEditingVariationComboId(null)} />
                                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800 flex flex-col">
                                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 uppercase">
                                                    <i className="bi bi-layers-fill text-purple-600"></i>
                                                    Composição da Variação: <span className="text-purple-600">{formData.variations?.find(v => v.id === editingVariationComboId)?.name}</span>
                                                </h3>
                                                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1 italic">Defina quais itens compõem esta versão específica do combo.</p>
                                            </div>
                                            <button
                                                onClick={() => setEditingVariationComboId(null)}
                                                className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl flex items-center justify-center transition-all"
                                            >
                                                <i className="bi bi-x-lg text-lg"></i>
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                            <ComboItemSelector
                                                currentItems={formData.variations?.find(v => v.id === editingVariationComboId)?.comboItems || []}
                                                onAdd={(newItem) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        variations: prev.variations?.map(v => v.id === editingVariationComboId ? {
                                                            ...v,
                                                            comboItems: [...(v.comboItems || []), newItem]
                                                        } : v)
                                                    }));
                                                }}
                                                onRemove={(idx) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        variations: prev.variations?.map(v => v.id === editingVariationComboId ? {
                                                            ...v,
                                                            comboItems: v.comboItems?.filter((_, i) => i !== idx)
                                                        } : v)
                                                    }));
                                                }}
                                                onUpdateQuantity={(idx, qty) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        variations: prev.variations?.map(v => v.id === editingVariationComboId ? {
                                                            ...v,
                                                            comboItems: v.comboItems?.map((item, i) => i === idx ? { ...item, quantity: qty } : item)
                                                        } : v)
                                                    }));
                                                }}
                                            />

                                            <div className="mt-8 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentVar = formData.variations?.find(v => v.id === editingVariationComboId);
                                                        const total = currentVar?.comboItems?.reduce((acc: number, item) => acc + ((item.unitPrice || 0) * item.quantity), 0) || 0;

                                                        setFormData(prev => ({
                                                            ...prev,
                                                            variations: prev.variations?.map(v => v.id === editingVariationComboId ? {
                                                                ...v,
                                                                unitPrice: Number(total.toFixed(2)),
                                                                syncUnitPrice: false
                                                            } : v)
                                                        }));
                                                        toast.info(`Preço da variação atualizado: R$ ${total.toFixed(2)}`);
                                                    }}
                                                    className="flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <i className="bi bi-calculator"></i> Somar Itens e Atualizar Preço
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setEditingVariationComboId(null)}
                                                className="px-10 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
                                            >
                                                Concluído
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ECOMMERCE TAB */}
                    {activeTab === 'ecommerce' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Sub-tabs Navigation */}
                            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-950/50 rounded-2xl self-start">
                                {[
                                    { id: 'photos', label: 'Fotos', icon: 'bi-images' },
                                    { id: 'descriptions', label: 'Descrição / Canais', icon: 'bi-pencil-square' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveEcommerceSubTab(tab.id as any)}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeEcommerceSubTab === tab.id
                                            ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <i className={`bi ${tab.icon}`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Sub-tab: Photos */}
                            {activeEcommerceSubTab === 'photos' && (
                                <div
                                    className={`bg-slate-50 dark:bg-slate-900/30 p-8 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col gap-8 ${isDraggingPhoto ? 'border-green-500 bg-green-50 dark:bg-green-900/10 scale-[1.01]' : 'border-slate-100 dark:border-slate-800'}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                                    onDragEnter={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingPhoto(false); }}
                                    onDrop={handleFileChange}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Galeria de Fotos</h4>
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Até 15 fotos — arraste e solte aqui ou clique em "Enviar Foto"</p>
                                        </div>
                                        <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-full transition-colors ${isDraggingPhoto ? 'text-green-700 bg-green-100 dark:bg-green-900/30' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'}`}>
                                            {isDraggingPhoto ? '📂 Solte aqui!' : `${formData.images?.length || 0} / 15`}
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
                                            <label
                                                htmlFor="product-photo-upload"
                                                className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900/30 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden"
                                            >
                                                <i className="bi bi-cloud-arrow-up text-3xl text-slate-300 group-hover:text-blue-500 dark:text-slate-700 transition-colors"></i>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 group-hover:text-blue-500">Enviar Foto</span>
                                                <input
                                                    id="product-photo-upload"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sub-tab: Descriptions / Channels */}
                            {activeEcommerceSubTab === 'descriptions' && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    {/* WhatsApp Description */}
                                    <div className="flex flex-col gap-6 bg-green-50/40 dark:bg-green-900/5 p-6 rounded-[2.5rem] border border-green-100 dark:border-green-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-200/50 dark:shadow-green-900/30">
                                                <i className="bi bi-whatsapp text-white text-base" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-green-800 dark:text-green-200">WhatsApp Marketplace</h4>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-0.5">Curta, direta e com emojis</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateAIDescription('whatsapp')}
                                                disabled={isGeneratingWhatsapp}
                                                className="ml-auto flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {isGeneratingWhatsapp ? <i className="bi bi-hourglass-split animate-spin text-sm" /> : <i className="bi bi-robot text-sm" />}
                                                {isGeneratingWhatsapp ? "Gerando..." : "Gerar c/ IA"}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Base (Personalizado)</label>
                                                <span className="text-[9px] text-blue-600 font-black uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                    <i className="bi bi-magic mr-1"></i>Opcional
                                                </span>
                                            </div>
                                            <textarea
                                                rows={4}
                                                value={formData.whatsappTemplate || ""}
                                                onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-medium dark:text-slate-300 resize-none custom-scrollbar"
                                                placeholder="[NOME DO PRODUTO]\n[PREÇO]\n..."
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                <i className="bi bi-pencil-square text-green-500" /> Recheio da Descrição:
                                            </p>
                                            <textarea
                                                rows={10}
                                                value={formData.whatsappDescription || ''}
                                                onChange={(e) => setFormData({ ...formData, whatsappDescription: e.target.value })}
                                                placeholder="Aqui aparecerá o conteúdo gerado pela IA..."
                                                className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-green-100 dark:border-green-900/30 rounded-[1.5rem] focus:ring-2 focus:ring-green-400 outline-none transition-all text-sm dark:text-slate-300 custom-scrollbar resize-none font-medium leading-relaxed"
                                            />
                                        </div>
                                    </div>

                                    {/* E-commerce Description */}
                                    <div className="flex flex-col gap-6 bg-blue-50/30 dark:bg-blue-900/5 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50 dark:shadow-blue-900/30">
                                                <i className="bi bi-globe2 text-white text-base" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-800 dark:text-blue-200">Marketplace / Ecommerce</h4>
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">Completa, para site e marketplaces</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateAIDescription('ecommerce')}
                                                disabled={isGeneratingEcommerce}
                                                className="ml-auto flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {isGeneratingEcommerce ? <i className="bi bi-hourglass-split animate-spin text-sm" /> : <i className="bi bi-robot text-sm" />}
                                                {isGeneratingEcommerce ? "Gerando..." : "Gerar c/ IA"}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                <i className="bi bi-pencil-square text-blue-600" /> Descrição:
                                            </p>
                                            <textarea
                                                rows={17}
                                                value={formData.ecommerceDescription || ''}
                                                onChange={(e) => setFormData({ ...formData, ecommerceDescription: e.target.value })}
                                                placeholder="Descreva as especificações para o Ecommerce. Use HTML (<b>, <ul>, etc) para formatar."
                                                className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-900/30 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-slate-300 custom-scrollbar resize-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                <div className="md:col-span-1">
                                    <SmartInput
                                        label="Material / Composição"
                                        value={formData.fiscal?.material || ""}
                                        onValueChange={(val) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, material: val } })}
                                        suggestions={["Madeira MDF", "Vidro Canelado", "Aço Inox", "Algodão", "Plástico ABS"]}
                                        placeholder="Ex: Madeira MDF e Vidro"
                                    />
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 italic mt-1">O material ajuda a IA a buscar o NCM exato.</p>
                                </div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">NCM (8 Dígitos)</label>
                                        <button
                                            onClick={handleGenerateNCM}
                                            type="button"
                                            className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            <i className="bi bi-magic mr-1"></i>Buscar c/ IA
                                        </button>
                                    </div>
                                    <SmartInput
                                        value={formData.fiscal?.ncm || ""}
                                        onValueChange={(val) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, ncm: val } })}
                                        tableName="products"
                                        columnName="fiscal->ncm"
                                        placeholder="0000.00.00"
                                    />
                                    {formData.fiscal?.ncmDescription && (
                                        <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-tight mt-1">
                                            <i className="bi bi-info-circle mr-1"></i>{formData.fiscal.ncmDescription}
                                        </p>
                                    )}
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

                                <div>
                                    <SmartInput
                                        label="Situação Tributária (CST/CSOSN)"
                                        value={formData.fiscal?.cst}
                                        onValueChange={(val) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cst: val } })}
                                        suggestions={["101", "102", "300", "400", "500", "00", "20", "40", "60"]}
                                        placeholder="EX: 102 ou 00"
                                    />
                                </div>
                                <div>
                                    <SmartInput
                                        label="CFOP Padrão"
                                        value={formData.fiscal?.cfop}
                                        onValueChange={(val) => setFormData({ ...formData, fiscal: { ...formData.fiscal!, cfop: val } })}
                                        suggestions={["5102", "5405", "6102", "6405", "5933"]}
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
