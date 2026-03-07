import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, runTransaction } from "firebase/firestore";
import Service from "../types/service.type";

const COLLECTION_NAME = "services";
const METADATA_COLLECTION = "metadata";
const COUNTER_DOC = "serviceCounter";

export const subscribeToServices = (callback: (services: Service[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));

    return onSnapshot(q, (querySnapshot) => {
        const services: Service[] = [];

        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() } as Service);
        });

        services.sort((a, b) => (a.description || "").localeCompare(b.description || ""));

        callback(services);
    }, (error) => {
        console.error("Erro no listener do Firebase para serviços:", error);
        callback([]);
    });
};

export const saveService = async (service: Service): Promise<void> => {
    if (service.id) {
        await updateService(service.id, service);
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
            
            const newService = {
                ...service,
                id: newId,
                active: service.active ?? true,
                deleted: false,
                createdAt: now,
                updatedAt: now
            };

            transaction.set(counterRef, { current: nextIdValue });
            transaction.set(doc(db, COLLECTION_NAME, newId), newService);
        });
    } catch (error) {
        console.error("Erro ao salvar o serviço: ", error);
        throw error;
    }
};

export const updateService = async (id: string, serviceToUpdate: Partial<Service>): Promise<void> => {
    try {
        const now = new Date().toLocaleString('pt-BR');
        const updated = {
            ...serviceToUpdate,
            updatedAt: now
        }
        await setDoc(doc(db, COLLECTION_NAME, id), updated, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar o serviço: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateService(id, { 
            deleted: true, 
             active: false
        });
    } catch (error) {
        console.error("Erro ao mover serviço para lixeira: ", error);
        throw error;
    }
};

export const restoreService = async (id: string): Promise<void> => {
    try {
        await updateService(id, { 
            deleted: false,
            active: true
        });
    } catch (error) {
        console.error("Erro ao restaurar o serviço: ", error);
        throw error;
    }
};

export const permanentDeleteService = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erro ao deletar permanentemente o serviço: ", error);
        throw error;
    }
};
