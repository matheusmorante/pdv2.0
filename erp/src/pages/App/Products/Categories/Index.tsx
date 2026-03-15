import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchGroupsAndCategories, createGroup, updateGroup, deleteGroup, createCategory, updateCategory, deleteCategory } from '@/pages/utils/categoryService';

const Categories = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [relations, setRelations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingGroup, setEditingGroup] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Group Form State
    const [groupName, setGroupName] = useState("");

    // Category Form State
    const [catName, setCatName] = useState("");
    const [selectedParents, setSelectedParents] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchGroupsAndCategories();
            setGroups(data.groups);
            setCategories(data.categories);
            setRelations(data.relations);
        } catch (error) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGroup = async () => {
        if (!groupName.trim()) return toast.error("O nome do pai não pode estar vazio.");
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, groupName);
                toast.success("Categoria Pai atualizada!");
            } else {
                await createGroup(groupName);
                toast.success("Categoria Pai criada!");
            }
            setEditingGroup(null);
            setGroupName("");
            loadData();
        } catch (error) {
            toast.error("Erro ao salvar Categoria Pai.");
        }
    };

    const handleSaveCategory = async () => {
        if (!catName.trim()) return toast.error("O nome da subcategoria não pode estar vazio.");
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, catName, selectedParents);
                toast.success("Subcategoria atualizada!");
            } else {
                await createCategory(catName, selectedParents);
                toast.success("Subcategoria criada!");
            }
            setEditingCategory(null);
            setCatName("");
            setSelectedParents([]);
            loadData();
        } catch (error) {
            toast.error("Erro ao salvar Subcategoria.");
        }
    };

    const handleDeleteGroup = async (id: string) => {
        if (!window.confirm("Isso apagará este Pai permanentemente e removerá as subcategorias atreladas a ele. Deseja continuar?")) return;
        try {
            await deleteGroup(id);
            toast.success("Pai excluído!");
            loadData();
        } catch (error) {
            toast.error("Erro ao excluir pai.");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm("Isso apagará esta subcategoria permanentemente e a removerá de todos os produtos atrelados. Deseja continuar?")) return;
        try {
            await deleteCategory(id);
            toast.success("Subcategoria excluída!");
            loadData();
        } catch (error) {
            toast.error("Erro ao excluir subcategoria.");
        }
    };

    const toggleParent = (groupId: string) => {
        setSelectedParents(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <i className="bi bi-diagram-3-fill text-blue-600"></i>
                Gestão de Categorias e Ambientes
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Categorias Pai */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                        1. Categorias Pai
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        "Cozinha", "Quarto", "Sala de Estar". Usadas apenas para agrupar as subcategorias.
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder={editingGroup ? "Editar Categoria Pai..." : "Nova Categoria Pai..."}
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleSaveGroup} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2">
                            <i className={editingGroup ? "bi bi-check-lg" : "bi bi-plus-lg"}></i>
                            {editingGroup ? "Salvar" : "Adicionar"}
                        </button>
                        {editingGroup && (
                            <button onClick={() => { setEditingGroup(null); setGroupName(""); }} className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        {groups.map(group => (
                            <div key={group.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition">
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{group.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setEditingGroup(group); setGroupName(group.name); }} className="p-2 text-slate-400 hover:text-blue-600 transition">
                                        <i className="bi bi-pencil-fill"></i>
                                    </button>
                                    <button onClick={() => handleDeleteGroup(group.id)} className="p-2 text-slate-400 hover:text-red-600 transition">
                                        <i className="bi bi-trash-fill"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subcategorias */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                        2. Subcategorias (Filhos)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        "Armário Multiuso", "Aparador". Estas são atreladas aos produtos. Elas podem pertencer a um ou mais Pais.
                    </p>

                    <div className="flex flex-col gap-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                                placeholder={editingCategory ? "Editar Subcategoria..." : "Nova Subcategoria..."}
                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-500">Selecione os Pais desta subcategoria:</span>
                            <div className="flex flex-wrap gap-2">
                                {groups.map(g => {
                                    const isSelected = selectedParents.includes(g.id);
                                    return (
                                        <button
                                            key={g.id}
                                            onClick={() => toggleParent(g.id)}
                                            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                                        >
                                            {g.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={handleSaveCategory} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <i className={editingCategory ? "bi bi-check-lg" : "bi bi-plus-lg"}></i>
                                {editingCategory ? "Salvar Subcategoria" : "Criar Subcategoria"}
                            </button>
                            {editingCategory && (
                                <button onClick={() => { setEditingCategory(null); setCatName(""); setSelectedParents([]); }} className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                                    <i className="bi bi-x-lg"></i> Cancelar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto mt-4">
                        {categories.map(cat => {
                            const catParents = relations.filter(r => r.categoryId === cat.id).map(r => groups.find(g => g.id === r.groupId)?.name).filter(Boolean);
                            return (
                                <div key={cat.id} className="flex flex-col gap-2 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{cat.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => {
                                                setEditingCategory(cat);
                                                setCatName(cat.name);
                                                setSelectedParents(relations.filter(r => r.categoryId === cat.id).map(r => r.groupId));
                                            }} className="p-2 text-slate-400 hover:text-blue-600 transition">
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600 transition">
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {catParents.length > 0 ? catParents.map((pName, i) => (
                                            <span key={i} className="px-2 py-[2px] bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md">
                                                {pName}
                                            </span>
                                        )) : (
                                            <span className="px-2 py-[2px] bg-red-50 dark:bg-red-900/20 text-[10px] font-bold text-red-500 rounded-md border border-red-100 dark:border-red-900/30">
                                                Sem Pai
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* VISÃO EM ÁRVORE */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm overflow-hidden text-slate-200">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        <i className="bi bi-diagram-2-fill text-blue-500"></i>
                        3. Visão em Árvore
                    </h2>
                    <p className="text-xs text-slate-400">
                        Visualize como as subcategorias estão distribuídas dentro das suas Categorias Pai.
                    </p>

                    <div className="flex flex-col gap-4 mt-2">
                        {groups.map(group => {
                            // Find all category IDs for this group
                            const subCatsIds = relations.filter(r => r.groupId === group.id).map(r => r.categoryId);
                            // Find category objects for those IDs
                            const subCats = categories.filter(c => subCatsIds.includes(c.id));

                            return (
                                <div key={group.id} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                                            <i className="bi bi-folder2-open text-xs"></i>
                                        </div>
                                        <span className="font-black tracking-widest uppercase text-sm">{group.name}</span>
                                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-bold">{subCats.length}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 pl-3 ml-3 border-l-2 border-slate-700/50">
                                        {subCats.length > 0 ? subCats.map(cat => (
                                            <div key={cat.id} className="flex items-center gap-2">
                                                <div className="w-4 border-b-2 border-slate-700/50"></div>
                                                <span className="text-xs font-bold text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50 hover:border-slate-600 transition-colors">
                                                    {cat.name}
                                                </span>
                                            </div>
                                        )) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 border-b-2 border-slate-700/50"></div>
                                                <span className="text-[10px] font-bold text-slate-500 italic">Vazio</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {groups.length === 0 && (
                            <div className="text-center py-6 text-slate-500 text-sm italic">Nenhuma categoria cadastrada.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Categories;
