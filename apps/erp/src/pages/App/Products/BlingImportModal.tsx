import React, { useState } from "react";
import { importBlingCSV, importBlingPeopleCSV, BlingImportResult, BlingPeopleImportResult } from "../../utils/blingImporterService";
import { toast } from "react-toastify";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    type?: 'products' | 'suppliers' | 'customers';
}

const BlingImportModal = ({ isOpen, onClose, onSuccess, type = 'products' }: Props) => {
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setResult(null);

        try {
            const text = await file.text();
            let res;
            if (type === 'suppliers' || type === 'customers') {
                res = await importBlingPeopleCSV(text, type as 'suppliers' | 'customers');
            } else {
                res = await importBlingCSV(text);
            }
            setResult(res);
            
            if (res.errors.length > 0) {
                toast.warning("Importação concluída com alguns erros.");
            } else {
                toast.success("Importação concluída com sucesso!");
                onSuccess();
            }
        } catch (error: any) {
            console.error("Erro na importação:", error);
            toast.error(error.message || "Erro inesperado ao importar CSV.");
        } finally {
            setIsImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            Importar do Bling
                        </h2>
                        <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">
                            Carregar arquivo CSV de {type === 'suppliers' ? 'fornecedores' : type === 'customers' ? 'clientes' : 'produtos'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {!result ? (
                        <div className="w-full">
                            <label className={`
                                w-full h-40 flex flex-col items-center justify-center gap-4
                                border-2 border-dashed rounded-[2rem] transition-all cursor-pointer
                                ${isImporting 
                                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed' 
                                    : 'bg-blue-50/30 border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-blue-900/10 dark:border-blue-900/30 dark:hover:bg-blue-900/20'}
                            `}>
                                {isImporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                        <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Processando...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                            <i className="bi bi-cloud-arrow-up-fill text-2xl"></i>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Clique para selecionar o CSV</span>
                                            <span className="text-xs text-slate-400">Suporta formato padrão do Bling (;)</span>
                                        </div>
                                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                                    </>
                                )}
                            </label>

                            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-2">
                                    <i className="bi bi-info-circle-fill"></i> Importante
                                </h4>
                                <ul className="text-[11px] font-medium text-amber-800/70 dark:text-amber-200/50 space-y-1 ml-4 list-disc">
                                    <li>O sistema criará fornecedores automaticamente.</li>
                                    <li>Produtos com o mesmo código serão atualizados.</li>
                                    <li>Variações serão agrupadas pelo "Código Pai".</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full animate-fade-in">
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 mb-6 text-center">
                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
                                    <i className="bi bi-check-lg text-2xl"></i>
                                </div>
                                <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-400 mb-4">Importação Realizada!</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                            {type === 'suppliers' || type === 'customers' ? result.peopleCreated : result.productsInserted}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {type === 'suppliers' ? 'Fornecedores' : type === 'customers' ? 'Clientes' : 'Produtos'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{result.totalRead}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Registros</span>
                                    </div>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="max-h-40 overflow-y-auto mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Erros encontrados:</h4>
                                    {result.errors.map((err: string, i: number) => (
                                        <p key={i} className="text-[10px] text-red-700/70 dark:text-red-400/70 py-1 border-b border-red-100/50 last:border-0">{err}</p>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlingImportModal;
