import Order from "../types/pdvAction.type";
import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot } from "firebase/firestore";

const COLLECTION_NAME = "orders";

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME));

    // Return the unsubscribe function
    return onSnapshot(q, (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            orders.push(doc.data() as Order);
        });

        // Let's sort locally by date descending
        orders.sort((a, b) => {
            return b.date.localeCompare(a.date);
        });

        callback(orders);
    }, (error) => {
        console.error("Erro no listener do Firebase:", error);
        callback([]);
    });
};

export const saveOrder = async (order: Order): Promise<void> => {
    if (order.id) {
        await updateOrder(order);
        return;
    }

    // Creating a new order
    const newId = crypto.randomUUID();
    const newOrder = {
        ...order,
        id: newId,
        date: new Date().toLocaleString('pt-BR')
    };

    try {
        await setDoc(doc(db, COLLECTION_NAME, newId), newOrder);
    } catch (error) {
        console.error("Erro ao salvar o pedido: ", error);
        throw error;
    }
};

export const updateOrder = async (orderToUpdate: Order): Promise<void> => {
    if (!orderToUpdate.id) return;
    try {
        const updated = {
            ...orderToUpdate,
            date: new Date().toLocaleString('pt-BR')
        }
        await setDoc(doc(db, COLLECTION_NAME, orderToUpdate.id), updated, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar o pedido: ", error);
        throw error;
    }
};

export const deleteOrder = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erro ao deletar o pedido: ", error);
        throw error;
    }
};
