import Order from "../types/pdvAction.type";
import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, runTransaction } from "firebase/firestore";
import { getSettings } from "./settingsService";
import { capitalizeOrder } from "./formatters";

const COLLECTION_NAME = "orders";
const METADATA_COLLECTION = "metadata";
const COUNTER_DOC = "orderCounter";

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));

    return onSnapshot(q, (querySnapshot) => {
        const orders: Order[] = [];
        const settings = getSettings();
        
        const today = new Date();
        const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');

        querySnapshot.forEach((doc) => {
            const rawData = doc.data() as Order;
            
            // Auto-capitalize existing data
            const data = capitalizeOrder(rawData);
            
            // If capitalization changed something, save back to DB quietly
            if (JSON.stringify(rawData) !== JSON.stringify(data) && data.id) {
                updateOrder(data.id, data).catch(console.error);
            }
            

            orders.push(data);
        });

        orders.sort((a, b) => {
            // Sort by numerical ID if possible, otherwise date
            const idA = parseInt(a.id || "0", 10);
            const idB = parseInt(b.id || "0", 10);
            if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
            return (b.date || "").localeCompare(a.date || "");
        });

        callback(orders);
    }, (error) => {
        console.error("Erro no listener do Firebase:", error);
        callback([]);
    });
};

export const saveOrder = async (order: Order): Promise<void> => {
    if (order.id) {
        await updateOrder(order.id, order);
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, METADATA_COLLECTION, COUNTER_DOC);
            const counterSnap = await transaction.get(counterRef);

            let nextId = 1;
            if (counterSnap.exists()) {
                nextId = (counterSnap.data().current || 0) + 1;
            }

            const newId = String(nextId);
            const newOrder = {
                ...order,
                id: newId,
                date: new Date().toLocaleString('pt-BR')
            };

            transaction.set(counterRef, { current: nextId });
            transaction.set(doc(db, COLLECTION_NAME, newId), newOrder);
        });
    } catch (error) {
        console.error("Erro ao salvar o pedido sequencial: ", error);
        throw error;
    }
};

export const updateOrder = async (id: string, orderToUpdate: Partial<Order>): Promise<void> => {
    try {
        const updated = {
            ...orderToUpdate,
            // Keep the original date if possible or update it
        }
        await setDoc(doc(db, COLLECTION_NAME, id), updated, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar o pedido: ", error);
        throw error;
    }
};

export const moveToTrash = async (id: string): Promise<void> => {
    try {
        await updateOrder(id, { 
            deleted: true, 
            deletedAt: new Date().toLocaleString('pt-BR') 
        });
    } catch (error) {
        console.error("Erro ao mover para lixeira: ", error);
        throw error;
    }
};

export const restoreOrder = async (id: string): Promise<void> => {
    try {
        await updateOrder(id, { 
            deleted: false,
            deletedAt: undefined 
        });
    } catch (error) {
        console.error("Erro ao restaurar o pedido: ", error);
        throw error;
    }
};

export const permanentDeleteOrder = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erro ao deletar permanentemente o pedido: ", error);
        throw error;
    }
};

/** @deprecated Use moveToTrash instead */
export const deleteOrder = moveToTrash;
