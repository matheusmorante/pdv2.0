import { useState, useEffect } from "react";
import VariationType from "../../types/variation.type";
import { subscribeToVariations, moveToTrash } from "../../utils/variationService";
import { toast } from "react-toastify";

export const useVariations = () => {
    const [variations, setVariations] = useState<VariationType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToVariations((data) => {
            setVariations(data.filter((v) => !v.deleted));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza que deseja apagar esta variação?")) return;
        try {
            await moveToTrash(id);
            toast.success("Variação movida para a lixeira.");
        } catch {
            toast.error("Erro ao apagar variação.");
        }
    };

    return { variations, loading, handleDelete };
};
