import { useState } from "react";
import VariationType, { VariationOption, VariationVisibilitySettings } from "../../types/variation.type";
import VariationFormModal from "./VariationFormModal";
import { useVariations } from "./useVariations";

type VisibilityKey = keyof VariationVisibilitySettings;

const COLUMN_OPTIONS: { key: VisibilityKey; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "options", label: "Opções" },
];

const DEFAULT_VISIBILITY: VariationVisibilitySettings = {
    id: true,
    name: true,
    options: true,
    actions: true,
};

const Variations = () => {
    const { variations, handleDelete } = useVariations();

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVariation, setEditingVariation] = useState<VariationType | null>(null);
    const [visibility, setVisibility] = useState<VariationVisibilitySettings>(DEFAULT_VISIBILITY);
    const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

    const toggleColumn = (key: VisibilityKey) =>
        setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));

    const openEdit = (variation: VariationType) => {
        setEditingVariation(variation);
        setIsFormOpen(true);
    };

    const openAdd = () => {
        setEditingVariation(null);
        setIsFormOpen(true);
    };

    const filteredVariations = variations.filter(
        (v) =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.id && v.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900 overflow-hidden relative">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 p-8 shadow-sm relative z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <i className="bi bi-ui-radios text-2xl text-blue-600" />
                            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                Variações
                            </h1>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Gestão de Tipos de Variação (Cores, Tamanhos)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative group">
                            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar variações..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold dark:text-slate-300 w-64"
                            />
                        </div>

                        {/* Column visibility */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                                className="h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl flex items-center justify-center transition-all shadow-sm group"
                                title="Colunas Visíveis"
                            >
                                <i className="bi bi-view-list text-lg text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </button>

                            {showVisibilityMenu && (
                                <div className="absolute right-0 top-14 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
                                        Colunas Visíveis
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                        {COLUMN_OPTIONS.map((col) => (
                                            <button
                                                key={col.key}
                                                onClick={() => toggleColumn(col.key)}
                                                className="flex items-center justify-between px-3 py-2 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300"
                                            >
                                                {col.label}
                                                <i
                                                    className={`bi bi-check text-lg ${
                                                        visibility[col.key]
                                                            ? "text-blue-600 opacity-100"
                                                            : "opacity-0"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={openAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <i className="bi bi-plus-lg text-sm" />
                            <span className="hidden sm:inline">Nova Variação</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Table */}
            <main className="flex-1 overflow-x-auto overflow-y-auto p-8 relative z-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto min-w-[800px]">
                    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    {visibility.id && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>}
                                    {visibility.name && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>}
                                    {visibility.options && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Opções</th>}
                                    {visibility.actions && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-24">Ações</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {filteredVariations.length > 0 ? (
                                    filteredVariations.map((v) => (
                                        <tr
                                            key={v.id}
                                            onClick={() => openEdit(v)}
                                            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                                        >
                                            {visibility.id && (
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                    #{v.id}
                                                </td>
                                            )}
                                            {visibility.name && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${v.active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{v.name}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {visibility.options && (
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {v.options.slice(0, 5).map((opt: VariationOption) => (
                                                            <span
                                                                key={opt.id}
                                                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                                                            >
                                                                {opt.value}
                                                            </span>
                                                        ))}
                                                        {v.options.length > 5 && (
                                                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 dark:border-blue-800">
                                                                +{v.options.length - 5}
                                                            </span>
                                                        )}
                                                        {v.options.length === 0 && (
                                                            <span className="text-slate-400 italic text-xs">Sem opções cadastradas</span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            {visibility.actions && (
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={(e) => handleDelete(v.id!, e)}
                                                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors flex items-center justify-center active:scale-95"
                                                            title="Apagar Variação"
                                                        >
                                                            <i className="bi bi-trash" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm font-bold">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <i className="bi bi-ui-radios text-5xl opacity-20" />
                                                {searchTerm ? "Nenhuma variação encontrada." : "Nenhuma variação cadastrada."}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <VariationFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                variation={editingVariation}
            />
        </div>
    );
};

export default Variations;
