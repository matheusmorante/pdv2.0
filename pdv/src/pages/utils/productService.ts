import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, runTransaction } from "firebase/firestore";
import Product from "../types/product.type";

const COLLECTION_NAME = "products";
const METADATA_COLLECTION = "metadata";
const COUNTER_DOC = "productCounter";

const deepClean = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        return value === undefined ? null : value;
    }));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));

    return onSnapshot(q, (querySnapshot) => {
        const products: Product[] = [];

        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });

        products.sort((a, b) => (a.description || "").localeCompare(b.description || ""));

        callback(products);
    }, (error) => {
        console.error("Erro no listener do Firebase para produtos:", error);
        callback([]);
    });
};

export const saveProduct = async (product: Product): Promise<void> => {
    if (product.id) {
        await updateProduct(product.id, product);
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
            
            const newProduct = {
                ...product,
                id: newId,
                code: product.code || newId.padStart(4, '0'),
                active: product.active ?? true,
                deleted: false,
                createdAt: now,
                updatedAt: now
            };

            transaction.set(counterRef, { current: nextIdValue });
            transaction.set(doc(db, COLLECTION_NAME, newId), deepClean(newProduct));
        });
    } catch (error) {
        console.error("Erro ao salvar o produto: ", error);
        throw error;
    }
};

export const updateProduct = async (id: string, productToUpdate: Partial<Product>): Promise<void> => {
    try {
        const now = new Date().toLocaleString('pt-BR');
        const updated = deepClean({
            ...productToUpdate,
            updatedAt: now
        });
        await setDoc(doc(db, COLLECTION_NAME, id), updated, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar o produto: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateProduct(id, { 
            deleted: true, 
             active: false
        });
    } catch (error) {
        console.error("Erro ao mover produto para lixeira: ", error);
        throw error;
    }
};

export const restoreProduct = async (id: string): Promise<void> => {
    try {
        await updateProduct(id, { 
            deleted: false,
            active: true
        });
    } catch (error) {
        console.error("Erro ao restaurar o produto: ", error);
        throw error;
    }
};

export const permanentDeleteProduct = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erro ao deletar permanentemente o produto: ", error);
        throw error;
    }
};
