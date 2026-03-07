import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, runTransaction } from "firebase/firestore";
import VariationType from "../types/variation.type";

const COLLECTION_NAME = "variations";
const METADATA_COLLECTION = "metadata";
const COUNTER_DOC = "variationCounter";

export const subscribeToVariations = (callback: (variations: VariationType[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));

    return onSnapshot(q, (querySnapshot) => {
        const variations: VariationType[] = [];

        querySnapshot.forEach((doc) => {
            variations.push({ id: doc.id, ...doc.data() } as VariationType);
        });

        variations.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        callback(variations);
    }, (error) => {
        console.error("Erro no listener do Firebase para variações:", error);
        callback([]);
    });
};

export const saveVariation = async (variation: VariationType): Promise<void> => {
    if (variation.id) {
        await updateVariation(variation.id, variation);
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, METADATA_COLLECTION, COUNTER_DOC);
            const counterSnap = await transaction.get(counterRef);

            let nextIdValue = 1;
            if (counterSnap.exists()) {
                nextIdValue = (counterSnap.data().current || 0) + 1;
            }

            const newId = String(nextIdValue);
            const now = new Date().toLocaleString('pt-BR');
            
            const newVariation = {
                ...variation,
                id: newId,
                active: variation.active ?? true,
                deleted: false,
                createdAt: now,
                updatedAt: now
            };

            transaction.set(counterRef, { current: nextIdValue });
            transaction.set(doc(db, COLLECTION_NAME, newId), newVariation);
        });
    } catch (error) {
        console.error("Erro ao salvar a variação: ", error);
        throw error;
    }
};

export const updateVariation = async (id: string, variationToUpdate: Partial<VariationType>): Promise<void> => {
    try {
        const now = new Date().toLocaleString('pt-BR');
        const updated = {
            ...variationToUpdate,
            updatedAt: now
        }
        await setDoc(doc(db, COLLECTION_NAME, id), updated, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar a variação: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateVariation(id, { 
            deleted: true, 
             active: false
        });
    } catch (error) {
        console.error("Erro ao mover variação para lixeira: ", error);
        throw error;
    }
};

export const restoreVariation = async (id: string): Promise<void> => {
    try {
        await updateVariation(id, { 
            deleted: false,
            active: true
        });
    } catch (error) {
        console.error("Erro ao restaurar a variação: ", error);
        throw error;
    }
};

export const permanentDeleteVariation = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erro ao deletar permanentemente a variação: ", error);
        throw error;
    }
};
