import React, { useState, useRef } from 'react';
import { AppSettings } from '@/pages/utils/settingsService';
import { ImportConfig, EntityType } from '@/pages/utils/importMappingTypes';
import { toast } from 'react-toastify';
import { importBlingCSV, importBlingPeopleCSV, importBlingOrdersCSV, importBlingReceivablesCSV } from '@/pages/utils/blingImporterService';

interface ImportMappingSectionProps {
    settings: AppSettings;
    onChange: (path: string, value: any) => void;
}

const ImportMappingSection = ({ settings, onChange }: ImportMappingSectionProps) => {
    const [selectedEntity, setSelectedEntity] = useState<EntityType>('product');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mappings = settings.importMappings || [];

    const handleUpdateHeader = (configIndex: number, mappingIndex: number, newHeader: string) => {
        const newMappings = [...mappings];
        newMappings[configIndex].mappings[mappingIndex].csvHeader = newHeader;
        onChange('importMappings', newMappings);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            const content = event.target?.result as string;
            try {
                let result;
                if (selectedEntity === 'product' || selectedEntity === 'variation') {
                    const config = mappings.find(m => m.entityType === selectedEntity);
                    result = await importBlingCSV(content, config);
                    toast.success(`Importação concluída: ${result.productsInserted} itens processados.`);
                } else if (selectedEntity === 'customer' || selectedEntity === 'supplier') {
                    const config = mappings.find(m => m.entityType === selectedEntity);
                    result = await importBlingPeopleCSV(content, selectedEntity === 'customer' ? 'customers' : 'suppliers', config);
                    toast.success(`Importação concluída: ${result.peopleCreated} novos cadastros.`);
                } else if (selectedEntity === 'order') {
                    const config = mappings.find(m => m.entityType === 'order');
                    result = await importBlingOrdersCSV(content, config);
                    toast.success(`Importação concluída: ${result.inserted} pedidos sincronizados.`);
                } else if (selectedEntity === 'receivable') {
                    const config = mappings.find(m => m.entityType === 'receivable');
                    result = await importBlingReceivablesCSV(content, config);
                    toast.success(`Importação concluída: ${result.inserted} contas a receber criadas.`);
                } else {
                    toast.info("Importação para este tipo de dado ainda em desenvolvimento.");
                }

                if (result?.errors && result.errors.length > 0) {
                    toast.warning(`${result.errors.length} erros encontrados durante o processo.`);
                }
            } catch (err: any) {
                toast.error(`Erro na importação: ${err.message}`);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const entityOptions: { id: EntityType; label: string; icon: string; color: string }[] = [
        { id: 'product', label: 'Produtos', icon: 'bi-box-seam', color: 'purple' },
        { id: 'variation', label: 'Variações', icon: 'bi-layers', color: 'indigo' },
        { id: 'customer', label: 'Clientes', icon: 'bi-person-heart', color: 'pink' },
        { id: 'supplier', label: 'Fornecedores', icon: 'bi-truck', color: 'orange' },
        { id: 'order', label: 'Pedidos / Vendas', icon: 'bi-cart-check', color: 'blue' },
        { id: 'receivable', label: 'Contas a Receber', icon: 'bi-cash-coin', color: 'emerald' },
    ];

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            {/* Import Action Area */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 dark:shadow-none border border-slate-700">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                            <i className="bi bi-cloud-arrow-up-fill text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Executar Importação</h3>
                            <p className="text-slate-400 text-xs mt-1 font-medium">Selecione o tipo de dado e suba o arquivo CSV exportado do Bling.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {entityOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedEntity(opt.id)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                                    selectedEntity === opt.id
                                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                }`}
                            >
                                <i className={`bi ${opt.icon} text-xl`}></i>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-center">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <i className="bi bi-info-circle"></i>
                            O sistema usará as regras de conciliação definidas abaixo
                        </div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv"
                            className="hidden"
                        />
                        
                        <button
                            disabled={isImporting}
                            onClick={handleImportClick}
                            className={`px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isImporting ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processando...</>
                            ) : (
                                <><i className="bi bi-file-earmark-arrow-up"></i> Selecionar Arquivo e Importar</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100/50 dark:border-blue-800/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <i className="bi bi-shuffle text-xl"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Conciliação de Colunas</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Mapeie quais colunas do seu arquivo CSV do Bling correspondem aos campos do nosso ERP.
                            Isso permite que você importe dados mesmo se o formato do Bling mudar.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {mappings.map((config, cIdx) => (
                    <div key={config.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.entityType === 'product' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <i className={`bi ${config.entityType === 'product' ? 'bi-box-seam-fill' : 'bi-people-fill'} text-lg`}></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{config.name}</h3>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">Tipo: {config.entityType}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {config.mappings.map((m, mIdx) => (
                                <div key={m.erpField} className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                        <span>Campo no ERP: <strong className="text-slate-700 dark:text-slate-300">{m.erpField}</strong></span>
                                        {m.defaultValue && <span className="text-blue-500 lowercase">padrão: {m.defaultValue}</span>}
                                    </label>
                                    <div className="relative group">
                                        <i className="bi bi-chevron-right absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                                        <input
                                            type="text"
                                            value={m.csvHeader}
                                            onChange={(e) => handleUpdateHeader(cIdx, mIdx, e.target.value)}
                                            placeholder="Nome da coluna no CSV..."
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:border-blue-500 dark:text-slate-200 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImportMappingSection;
