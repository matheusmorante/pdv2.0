import { useState, useEffect, useMemo } from "react";
import Product from "../../../types/product.type";
import { subscribeToProducts, moveToTrash, restoreProduct, permanentDeleteProduct, updateProduct } from "../../../utils/productService";
import { toast } from "react-toastify";

export const useProducts = (filters?: any) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((data) => {
            setProducts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Reset pagination and selection when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedProducts([]);
    }, [filters]);

    const filteredProducts = useMemo(() => {
        const showTrash = filters?.showTrash || false;

        return products
            .filter(product => {
                // Filter by Deleted status first
                if (showTrash) {
                    if (!product.deleted) return false;
                } else {
                    if (product.deleted) return false;
                }

                if (!filters) return true;

                const searchMatch = !filters.search ||
                    product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                    product.code?.toLowerCase().includes(filters.search.toLowerCase());

                const categoryMatch = !filters.category ||
                    product.category === filters.category ||
                    (filters.category === "Serviços" && product.itemType === "service") ||
                    (filters.category === "Produtos" && product.itemType === "product");

                const activeMatch = filters.activeOnly === undefined || product.active === filters.activeOnly;

                return searchMatch && categoryMatch && activeMatch;
            })
            .sort((a, b) => {
                let comparison = 0;
                const sortBy = filters?.sortBy || 'description';

                if (sortBy === "description") {
                    comparison = (a.description || "").localeCompare(b.description || "");
                } else if (sortBy === "unitPrice") {
                    comparison = (a.unitPrice || 0) - (b.unitPrice || 0);
                } else if (sortBy === "stock") {
                    comparison = (a.stock || 0) - (b.stock || 0);
                } else if (sortBy === "code") {
                    comparison = (a.code || "").localeCompare(b.code || "");
                }

                const sortOrder = filters?.sortOrder || 'asc';
                return sortOrder === "asc" ? comparison : -comparison;
            });
    }, [products, filters]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const totalItems = filteredProducts.length;

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handleDelete = async (id: string) => {
        await moveToTrash(id);
        toast.info("Produto movido para a lixeira.");
    };

    const handleRestore = async (id: string) => {
        await restoreProduct(id);
        toast.success("Produto restaurado com sucesso!");
    };

    const handlePermanentDelete = async (id: string) => {
        if (window.confirm("Certeza que deseja excluir DEFINITIVAMENTE este produto?")) {
            await permanentDeleteProduct(id);
            toast.success("Produto excluído permanentemente.");
        }
    };

    const handleBulkTrash = async () => {
        if (selectedProducts.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedProducts.map(id => moveToTrash(id)));
            toast.info(`${selectedProducts.length} produto(s) movido(s) para a lixeira.`);
            setSelectedProducts([]);
        } catch (error) {
            toast.error("Erro ao mover alguns produtos para a lixeira.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkRestore = async () => {
        if (selectedProducts.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedProducts.map(id => restoreProduct(id)));
            toast.success(`${selectedProducts.length} produto(s) restaurado(s) com sucesso!`);
            setSelectedProducts([]);
        } catch (error) {
            toast.error("Erro ao restaurar alguns produtos.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedProducts.length === 0) return;
        if (window.confirm(`Excluir DEFINITIVAMENTE ${selectedProducts.length} produto(s)?`)) {
            setLoading(true);
            try {
                await Promise.all(selectedProducts.map(id => permanentDeleteProduct(id)));
                toast.success(`${selectedProducts.length} produto(s) excluído(s) permanentemente.`);
                setSelectedProducts([]);
            } catch (error) {
                toast.error("Erro ao excluir alguns produtos.");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const allIdsOnPage = paginatedProducts.map(p => p.id!).filter(Boolean);
        const allSelected = allIdsOnPage.every(id => selectedProducts.includes(id));

        if (allSelected) {
            setSelectedProducts(prev => prev.filter(id => !allIdsOnPage.includes(id)));
        } else {
            const newSelections = allIdsOnPage.filter(id => !selectedProducts.includes(id));
            setSelectedProducts(prev => [...prev, ...newSelections]);
        }
    };

    const clearSelection = () => setSelectedProducts([]);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateProduct(id, { active: !currentStatus });
            toast.success(`Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
        } catch (error) {
            toast.error("Erro ao alterar status do produto.");
        }
    };

    return {
        products: paginatedProducts,
        totalItems,
        currentPage,
        itemsPerPage,
        totalPages,
        setCurrentPage,
        setItemsPerPage,
        loading,
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
    };
};
