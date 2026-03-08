import React, { useState } from "react";
import ProductFilters from "./ProductFilters";
import ProductList from "./ProductList";
import ProductFormModal from "./ProductFormModal";
import Product, { ProductVisibilitySettings } from "../../types/product.type";
import { Link } from "react-router-dom";

interface ProductFiltersData {
    search: string;
    category: string;
    activeOnly: boolean | undefined;
    sortBy: "description" | "unitPrice" | "stock" | "code";
    sortOrder: "asc" | "desc";
    showTrash?: boolean;
}

const Products = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [filters, setFilters] = useState<ProductFiltersData>({
        search: "",
        category: "",
        activeOnly: undefined,
        sortBy: "description",
        sortOrder: "asc",
    });

    const [visibilitySettings, setVisibilitySettings] = useState<ProductVisibilitySettings>({
        code: true,
        description: true,
        category: true,
        unitPrice: true,
        stock: true,
        unit: true,
        actions: true,
    });

    const toggleVisibility = (column: keyof ProductVisibilitySettings) => {
        setVisibilitySettings((prev: ProductVisibilitySettings) => ({ ...prev, [column]: !prev[column] }));
    };

    const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setFilters((prev: ProductFiltersData) => ({
            ...prev,
            sortBy: sortBy as any,
            sortOrder
        }));
    };

    const activeFilters = React.useMemo(() => ({ ...filters, showTrash: false }), [filters]);
    const trashFilters = React.useMemo(() => ({ ...filters, showTrash: true }), [filters]);

    return (
        <div className="flex -m-4 xl:-m-8 h-[calc(100vh-64px)] xl:h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
            {/* Sidebar for Filters */}
            <div className={`transition-all duration-300 ease-in-out border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 absolute md:relative z-30 h-full ${isSidebarOpen ? 'w-[calc(100vw-32px)] md:w-80 shadow-2xl md:shadow-none' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
                <div className="md:hidden flex justify-end p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-2">
                        <i className="bi bi-x-lg text-xl" />
                    </button>
                </div>
                <ProductFilters filters={filters} setFilters={setFilters} />
            </div>
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && <div className="md:hidden fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-10">
                <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 md:mb-10 gap-4 xl:gap-0">
                    <div className="flex items-start xl:items-center gap-4 xl:gap-6">
                        <div>
                            <h1 className="text-2xl xl:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                                Produtos e Serviços
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm xl:text-lg hidden sm:block">
                                Gerencie seus produtos, serviços e níveis de estoque
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => { setEditingProduct(null); setIsFormModalOpen(true); }}
                            className="flex items-center justify-center gap-2 xl:gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 xl:px-8 xl:py-4 rounded-xl xl:rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-95 w-full sm:w-auto mt-2 xl:mt-0"
                            title="Cadastrar novo produto ou serviço"
                        >
                            <i className="bi bi-plus-lg text-lg xl:text-xl" />
                            Novo Item
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Header Actions Container */}
                    <div className="flex justify-between items-center px-2">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest border ${isSidebarOpen
                                    ? 'bg-white text-blue-600 border-blue-100 dark:bg-slate-900 dark:border-blue-900/30'
                                    : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                                    }`}
                            >
                                <i className={`bi ${isSidebarOpen ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
                                Filtros
                            </button>

                            <button
                                onClick={() => setIsTrashOpen(true)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest border bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500`}
                            >
                                <i className="bi bi-trash3"></i>
                                Lixeira
                            </button>

                            <Link
                                to="/registrations/variations"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest border bg-white text-indigo-600 border-indigo-200 dark:bg-slate-900 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                            >
                                <i className="bi bi-ui-radios"></i>
                                Configurar Variações
                            </Link>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-widest ${showSettings
                                    ? 'border-blue-200 text-blue-600 dark:border-blue-800'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <i className={`bi ${showSettings ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                Visualização
                            </button>

                            {showSettings && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                                    <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-50 animate-slide-up">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Colunas da Tabela</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { key: 'code', label: 'Código' },
                                                { key: 'description', label: 'Descrição' },
                                                { key: 'category', label: 'Categoria' },
                                                { key: 'unitPrice', label: 'Preço de Venda' },
                                                { key: 'stock', label: 'Estoque' },
                                                { key: 'unit', label: 'Unidade' },
                                                { key: 'actions', label: 'Ações' },
                                            ].map((col) => (
                                                <button
                                                    key={col.key}
                                                    onClick={() => toggleVisibility(col.key as keyof ProductVisibilitySettings)}
                                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all group outline-none"
                                                >
                                                    <span className={`text-[11px] font-bold ${visibilitySettings[col.key as keyof ProductVisibilitySettings] ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-700'}`}>
                                                        {col.label}
                                                    </span>
                                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${visibilitySettings[col.key as keyof ProductVisibilitySettings] ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                                        <div className={`w-3 h-3 bg-white dark:bg-slate-300 rounded-full transition-transform ${visibilitySettings[col.key as keyof ProductVisibilitySettings] ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-transparent md:bg-white dark:bg-transparent dark:md:bg-slate-900 rounded-none md:rounded-3xl shadow-none md:shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-visible md:overflow-hidden md:border border-slate-100 dark:border-slate-800 transition-colors">
                        <ProductList
                            onEdit={(p) => { setEditingProduct(p); setIsFormModalOpen(true); }}
                            filters={activeFilters}
                            visibilitySettings={visibilitySettings}
                            onToggleColumn={toggleVisibility}
                            onSort={handleSort}
                        />
                    </div>
                </div>
            </div>

            {/* Trash Modal */}
            {isTrashOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTrashOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-6xl h-[80vh] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    Lixeira de Itens
                                </h2>
                                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1">Gerencie produtos e serviços excluídos</p>
                            </div>
                            <button onClick={() => setIsTrashOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <i className="bi bi-x-lg text-xl"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <ProductList
                                onEdit={(p) => { setEditingProduct(p); setIsFormModalOpen(true); }}
                                filters={trashFilters}
                                visibilitySettings={visibilitySettings}
                                onToggleColumn={toggleVisibility}
                                onSort={handleSort}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            <ProductFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingProduct(null); }}
                product={editingProduct}
            />
        </div>
    );
};

export default Products;