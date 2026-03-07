import React, { useState, useEffect, useCallback } from "react";
import { getSettings, saveSettings, AppSettings } from "../../utils/settingsService";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "react-toastify";
import { PatternFormat } from "react-number-format";
import { geocodeAddress } from "../../utils/maps";

// Modular Components
import SettingsSection from "./components/SettingsSection";
import SettingsSidebar from "./components/SettingsSidebar";
import StatusLabelsSection from "./components/StatusLabelsSection";
import LogisticsSection from "./components/LogisticsSection";
import HandlingSection from "./components/HandlingSection";
import AutoScrollSection from "./components/AutoScrollSection";
import AppearanceSection from "./components/AppearanceSection";
import SaveButton from "./components/SaveButton";

const categories = [
    { id: 'empresa', label: 'Dados da Empresa', icon: 'bi-building-fill', keywords: ['empresa', 'nome', 'endereço', 'loja', 'origem', 'cnpj', 'contato', 'telefone'] },
    { id: 'labels', label: 'Rótulos do Sistema', icon: 'bi-tags-fill', keywords: ['rascunho', 'agendado', 'atendido', 'cancelado', 'entrega', 'retirada'] },
    { id: 'logistica', label: 'Logística e Frete', icon: 'bi-truck', keywords: ['frete', 'km', 'distância', 'valor', 'entrega'] },
    { id: 'manuseio', label: 'Opções de Manuseio', icon: 'bi-box-seam-fill', keywords: ['manuseio', 'tipos', 'adicionar', 'entrega', 'retirada'] },
    { id: 'scroll', label: 'Scroll Automático', icon: 'bi-mouse3-fill', keywords: ['scroll', 'rolagem', 'automática', 'velocidade', 'sensibilidade'] },
    { id: 'automacao', label: 'Automação', icon: 'bi-robot', keywords: ['aviso', 'pendente', 'atrasado'] },
    { id: 'clientes', label: 'Clientes', icon: 'bi-people', keywords: ['capitalização', 'nomes', 'endereços'] },
    { id: 'comunicacao', label: 'Comunicação', icon: 'bi-chat-dots', keywords: ['google', 'review', 'avaliação', 'whatsapp'] },
    { id: 'aparencia', label: 'Aparência', icon: 'bi-palette', keywords: ['tema', 'escuro', 'claro', 'modo'] },
    { id: 'integracoes', label: 'Integrações', icon: 'bi-plug-fill', keywords: ['api', 'openrouteservice', 'mapa', 'rota', 'chave'] },
];

// Helper components moved OUTSIDE to prevent focus loss during re-renders
const ToggleControl = React.memo(({ label, description, value, onChange }: any) => (
    <div className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 max-w-lg">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">{label}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => onChange(e.target.checked)} />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 shadow-inner"></div>
            </label>
        </div>
    </div>
));

const InputControl = React.memo(({ label, description, value, onChange, type = "text" }: any) => (
    <div className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 max-w-lg">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">{label}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 dark:text-slate-200 w-full md:w-80 transition-all font-medium"
            />
        </div>
    </div>
));

const MaskedInputControl = React.memo(({ label, description, value, onChange, format }: any) => (
    <div className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 max-w-lg">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">{label}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <div className="w-full md:w-80">
                <PatternFormat
                    format={format}
                    mask="_"
                    value={value}
                    onValueChange={(values) => onChange(values.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 dark:text-slate-200 w-full transition-all font-medium"
                />
            </div>
        </div>
    </div>
));

/**
 * Settings Page
 * Orchestrates various configuration modules following Clean Code principles.
 */
const Settings = () => {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<AppSettings>(getSettings());
    const [search, setSearch] = useState("");

    // Sincroniza o estado das configurações sempre que o tema global mudar
    useEffect(() => {
        setSettings(prev => ({ ...prev, defaultTheme: theme }));
    }, [theme]);

    const handleChange = useCallback((path: string, value: any) => {
        // Se estivermos mudando o tema, atualizamos o contexto global imediatamente
        if (path === 'defaultTheme') {
            setTheme(value);
            return; // O useEffect acima cuidará de atualizar o estado 'settings'
        }

        setSettings((prev: AppSettings) => {
            const next = { ...prev };
            const parts = path.split('.');
            let current: any = next;
            
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = { ...current[parts[i]] };
                current = current[parts[i]];
            }
            
            current[parts[parts.length - 1]] = value;
            return next;
        });

        // Trigger coordinate update if address changes
        if (path === 'companyAddress' && value.length > 10) {
            handleUpdateOriginCoords(value);
        }
    }, [setTheme]);

    const handleUpdateOriginCoords = async (address: string) => {
        try {
            const coords = await geocodeAddress(address);
            if (coords) {
                setSettings(prev => ({ ...prev, storeOriginCoords: coords }));
            }
        } catch (e) {
            console.error("Erro ao atualizar coordenadas da loja:", e);
        }
    };

    const handleSave = () => {
        saveSettings(settings);
        toast.success("Configurações aplicadas com sucesso! ✨");
    };

    const isVisible = (id: string) => {
        if (!search) return true;
        const normalizedSearch = search.toLowerCase();
        const category = categories.find(c => c.id === id);
        if (!category) return false;
        
        return category.label.toLowerCase().includes(normalizedSearch) || 
               category.keywords.some(k => k.toLowerCase().includes(normalizedSearch));
    };

    return (
        <div className="flex flex-col gap-10 max-w-5xl mx-auto py-12 px-6 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-slide-down">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        Configurações do Sistema
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Preferências</h1>
                    <p className="text-slate-500 dark:text-slate-500 mt-2 text-base font-medium">Personalize cada detalhe da sua experiência no PDV.</p>
                </div>
                
                <div className="relative group w-full md:w-96">
                    <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 transition-colors group-focus-within:text-blue-500" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome ou funcionalidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 focus:border-blue-500 dark:focus:border-blue-500 transition-all shadow-xl shadow-slate-200/20 dark:shadow-none font-bold"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <SettingsSidebar categories={categories} />

                <div className="lg:col-span-9 pb-48">
                    <SettingsSection id="empresa" title="Dados da Empresa" icon="bi-building-fill" isVisible={isVisible('empresa')}>
                        <InputControl
                            label="Nome da Empresa"
                            description="Nome que será exibido em documentos e comunicações."
                            value={settings.companyName}
                            onChange={(v: string) => handleChange('companyName', v)}
                        />
                        <MaskedInputControl
                            label="CNPJ"
                            description="Cadastro Nacional da Pessoa Jurídica da empresa."
                            value={settings.companyCnpj}
                            format="##.###.###/####-##"
                            onChange={(v: string) => handleChange('companyCnpj', v)}
                        />
                         <MaskedInputControl
                            label="Telefone de Contato"
                            description="Telefone oficial de atendimento da empresa."
                            value={settings.companyPhone}
                            format="(##) #####-####"
                            onChange={(v: string) => handleChange('companyPhone', v)}
                        />
                        <InputControl
                            label="Endereço da Loja"
                            description="Endereço físico da loja usado como ponto de origem para cálculo de frete."
                            value={settings.companyAddress}
                            onChange={(v: string) => handleChange('companyAddress', v)}
                        />
                    </SettingsSection>

                    <SettingsSection id="labels" title="Rótulos do Sistema" icon="bi-tags-fill" isVisible={isVisible('labels')}>
                        <StatusLabelsSection settings={settings} onChange={handleChange} />
                    </SettingsSection>

                    <SettingsSection id="logistica" title="Logística e Frete" icon="bi-truck" isVisible={isVisible('logistica')}>
                        <LogisticsSection settings={settings} onChange={handleChange} />
                    </SettingsSection>

                    <SettingsSection id="manuseio" title="Opções de Manuseio" icon="bi-box-seam-fill" isVisible={isVisible('manuseio')}>
                        <HandlingSection settings={settings} onChange={handleChange} />
                    </SettingsSection>

                    <SettingsSection id="scroll" title="Scroll Automático" icon="bi-mouse3-fill" isVisible={isVisible('scroll')}>
                        <AutoScrollSection settings={settings} onChange={handleChange} />
                    </SettingsSection>

                    <SettingsSection id="automacao" title="Automação" icon="bi-robot" isVisible={isVisible('automacao')}>
                        <ToggleControl
                            label="Aviso de Pedido Pendente"
                            description="Exibe um rótulo piscante 'Pedido Atendido?' em pedidos atrasados para confirmação manual."
                            value={settings.showManualFulfillmentPrompt}
                            onChange={(v: boolean) => handleChange('showManualFulfillmentPrompt', v)}
                        />
                    </SettingsSection>

                    <SettingsSection id="clientes" title="Clientes" icon="bi-people" isVisible={isVisible('clientes')}>
                        <ToggleControl
                            label="Capitalização Automática"
                            description="Formata automaticamente nomes e endereços (Ex: 'joão' vira 'João') durante a digitação."
                            value={settings.autoCapitalizeCustomerData}
                            onChange={(v: boolean) => handleChange('autoCapitalizeCustomerData', v)}
                        />
                    </SettingsSection>

                    <SettingsSection id="comunicacao" title="Comunicação" icon="bi-chat-dots" isVisible={isVisible('comunicacao')}>
                        <InputControl
                            label="Link de Avaliação Google"
                            description="URL enviada aos clientes no WhatsApp para solicitar avaliações no Google Maps."
                            value={settings.googleReviewUrl}
                            onChange={(v: string) => handleChange('googleReviewUrl', v)}
                        />
                    </SettingsSection>

                    <SettingsSection id="aparencia" title="Aparência" icon="bi-palette" isVisible={isVisible('aparencia')}>
                        <AppearanceSection settings={settings} onChange={handleChange} />
                    </SettingsSection>

                    <SettingsSection id="integracoes" title="Integrações" icon="bi-plug-fill" isVisible={isVisible('integracoes')}>
                        <InputControl
                            label="Chave API OpenRouteService"
                            description="Permite o cálculo de rotas no mapa. O OSRM é utilizado como prioritário por ser mais rápido. A chave do ORS serve como backup caso o OSRM falhe."
                            value={settings.openRouteServiceApiKey}
                            onChange={(v: string) => handleChange('openRouteServiceApiKey', v)}
                        />
                    </SettingsSection>

                    <div className="mt-12 p-8 bg-blue-600/5 dark:bg-blue-600/10 border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-[2.5rem] flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-2xl shadow-2xl shadow-blue-400/40 mb-4 animate-bounce">
                            <i className="bi bi-shield-lock-fill" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Segurança das Configurações</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 max-w-md">Suas preferências são salvas localmente neste navegador. Lembre-se de salvar antes de sair.</p>
                    </div>
                </div>
            </div>

            <SaveButton onClick={handleSave} />
        </div>
    );
};

export default Settings;
