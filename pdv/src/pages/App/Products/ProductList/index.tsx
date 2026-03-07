import React from "react";
import ProductTable from "./ProductTable";
import { useProducts } from "./useProducts";
import Product, { ProductVisibilitySettings } from "../../../types/product.type";
import { toast } from "react-toastify";

interface ProductListProps {
    onEdit: (product: Product) => void;
    filters?: any;
    visibilitySettings: ProductVisibilitySettings;
    onToggleColumn: (column: keyof ProductVisibilitySettings) => void;
    onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
};

const ProductList = ({ onEdit, filters, visibilitySettings, onToggleColumn, onSort }: ProductListProps) => {
    const {
        products,
        loading,
        totalItems,
        currentPage,
        totalPages,
        setCurrentPage,
        handleDelete,
        handleRestore,
        handlePermanentDelete,
        selectedProducts,
        toggleSelection,
        selectAll,
        clearSelection,
        handleBulkTrash,
        handleBulkRestore,
        handleBulkPermanentDelete,
        toggleActive
    } = useProducts(filters);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando produtos...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <i className="bi bi-box-seam text-4xl text-slate-200 dark:text-slate-800"></i>
                </div>
                <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Nenhum produto encontrado</p>
                    <p className="text-slate-400 dark:text-slate-600 text-xs">Tente ajustar seus filtros ou adicione um novo produto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="p-4 md:p-8">
                <ProductTable
                    products={products}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                    onToggleActive={toggleActive}
                    visibilitySettings={visibilitySettings}
                    onToggleColumn={onToggleColumn}
                    showTrash={filters?.showTrash}
                    filters={filters}
                    onSort={onSort}
                    selectedProducts={selectedProducts}
                    onToggleSelection={toggleSelection}
                    onSelectAll={selectAll}
                    onClearSelection={clearSelection}
                    onBulkTrash={handleBulkTrash}
                    onBulkRestore={handleBulkRestore}
                    onBulkPermanentDelete={handleBulkPermanentDelete}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                            Mostrando {products.length} de {totalItems} produtos
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 dark:text-slate-600'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-100 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100 transition-all"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
