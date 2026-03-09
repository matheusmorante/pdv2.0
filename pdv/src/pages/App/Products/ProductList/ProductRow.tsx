import React from "react";
import Product, { ProductVisibilitySettings } from "../../../types/product.type";
import { formatCurrency } from "../../../utils/formatters";

interface ProductRowProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
    onToggleActive: (id: string, currentStatus: boolean) => void;
    onShowHistory?: (product: Product) => void;
    visibilitySettings: ProductVisibilitySettings;
    showTrash?: boolean;
    orderedColumnKeys?: string[];
    isSelected?: boolean;
    onToggleSelection?: () => void;
}

const ProductRow = ({
    product,
    onEdit,
    onDelete,
    onRestore,
    onPermanentDelete,
    onToggleActive,
    onShowHistory,
    visibilitySettings,
    showTrash,
    orderedColumnKeys,
    isSelected,
    onToggleSelection
}: ProductRowProps) => {

    const renderCell = (key: string) => {
        if (!visibilitySettings[key as keyof ProductVisibilitySettings]) return null;

        switch (key) {
            case 'code':
                return (
                    <td key="code" className="px-6 py-4 text-left">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                            {product.code || "-"}
                        </span>
                    </td>
                );
            case 'description':
                return (
                    <td key="description" className="px-6 py-4 text-left">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{product.description}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${product.itemType === 'service' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                    {product.itemType === 'service' ? 'Serviço' : 'Produto'}
                                </span>
                                {product.itemType === 'product' && product.condition && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest ${product.condition === 'salvado' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                        product.condition === 'usado' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        }`}>
                                        {product.condition === 'salvado' ? 'Salvado' : product.condition === 'usado' ? 'Usado' : 'Novo'}
                                    </span>
                                )}
                                {product.category && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                        {product.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </td>
                );
            case 'costPrice':
                return (
                    <td key="costPrice" className="px-6 py-4 text-right">
                        <button
                            onClick={(e) => { e.stopPropagation(); onShowHistory?.(product); }}
                            className="text-sm font-black text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform cursor-pointer"
                            title="Ver histórico de preço de custo"
                        >
                            {formatCurrency(product.costPrice || 0)}
                        </button>
                    </td>
                );
            case 'unitPrice':
                return (
                    <td key="unitPrice" className="px-6 py-4 text-right">
                        <button
                            onClick={(e) => { e.stopPropagation(); onShowHistory?.(product); }}
                            className="text-sm font-black text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform cursor-pointer"
                            title="Ver histórico de preço de venda"
                        >
                            {formatCurrency(product.unitPrice || 0)}
                        </button>
                    </td>
                );
            case 'stock':
                const isLowStock = (product.stock || 0) <= (product.minStock || 0);
                return (
                    <td key="stock" className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                            <span className={`text-sm font-black ${isLowStock ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {product.itemType === 'service' ? '-' : (product.stock ?? 0)}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                                {product.unit}
                            </span>
                        </div>
                    </td>
                );
            case 'unit':
                return (
                    <td key="unit" className="px-6 py-4 text-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {product.unit}
                        </span>
                    </td>
                );
            case 'category':
                return (
                    <td key="category" className="px-6 py-4 text-left">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {product.category || "-"}
                        </span>
                    </td>
                );
            case 'actions':
                return (
                    <td key="actions" className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                            {showTrash ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRestore(product.id!); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Restaurar Produto"
                                    >
                                        <i className="bi bi-arrow-counterclockwise text-sm" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPermanentDelete(product.id!); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Excluir Permanentemente"
                                    >
                                        <i className="bi bi-trash3-fill text-sm" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleActive(product.id!, product.active); }}
                                        className={`p-2 rounded-xl transition-all shadow-sm border ${product.active
                                            ? 'text-emerald-500 hover:text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                            : 'text-slate-400 hover:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                                        title={product.active ? "Desativar Produto" : "Ativar Produto"}
                                    >
                                        <i className={`bi ${product.active ? 'bi-toggle-on' : 'bi-toggle-off'} text-lg`} />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Editar Produto"
                                    >
                                        <i className="bi bi-pencil-fill text-sm" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(product.id!); }}
                                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                                        title="Mover para Lixeira"
                                    >
                                        <i className="bi bi-trash-fill text-sm" />
                                    </button>
                                </>
                            )}
                        </div>
                    </td>
                );
            default:
                return null;
        }
    };

    return (
        <tr
            className={`transition-colors group cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50`}
            onClick={() => onEdit(product)}
        >
            {/* Row Checkbox */}
            <td className="p-0 w-12 text-center">
                <label
                    className="flex items-center justify-center w-full h-full cursor-pointer py-4 px-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection?.()}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                    />
                </label>
            </td>

            {orderedColumnKeys ? orderedColumnKeys.map(key => renderCell(key)) : (
                <>
                    {renderCell('code')}
                    {renderCell('description')}
                    {renderCell('unitPrice')}
                    {renderCell('stock')}
                    {renderCell('actions')}
                </>
            )}
        </tr>
    );
};

export default ProductRow;
