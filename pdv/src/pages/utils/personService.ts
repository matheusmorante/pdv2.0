import { db } from "./firebaseConfig";
import { collection, doc, setDoc, deleteDoc, query, onSnapshot, runTransaction, where } from "firebase/firestore";
import Person from "../types/person.type";

export const subscribeToPeople = (collectionName: string, callback: (people: Person[]) => void) => {
    const q = query(collection(db, collectionName));

    return onSnapshot(q, (querySnapshot) => {
        const people: Person[] = [];

        querySnapshot.forEach((doc) => {
            people.push({ id: doc.id, ...doc.data() } as Person);
        });

        people.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

        callback(people);
    }, (error) => {
        console.error(`Erro no listener do Firebase para ${collectionName}:`, error);
        callback([]);
    });
};

export const savePerson = async (collectionName: string, person: Person): Promise<void> => {
    if (person.id) {
        await updatePerson(collectionName, person.id, person);
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const METADATA_COLLECTION = "metadata";
            const COUNTER_DOC = `${collectionName}Counter`;
            const counterRef = doc(db, METADATA_COLLECTION, COUNTER_DOC);
            const counterSnap = await transaction.get(counterRef);

            let nextIdValue = 1;
            if (counterSnap.exists()) {
                nextIdValue = (counterSnap.data().current || 0) + 1;
            }

            const newId = String(nextIdValue);
            const now = new Date().toLocaleString('pt-BR');
            
            const newPerson = {
                ...person,
                id: newId,
                active: person.active ?? true,
                deleted: false,
                createdAt: now,
                updatedAt: now
            };

            transaction.set(counterRef, { current: nextIdValue });
            transaction.set(doc(db, collectionName, newId), newPerson);
        });
    } catch (error) {
        console.error(`Erro ao salvar em ${collectionName}: `, error);
        throw error;
    }
};

export const updatePerson = async (collectionName: string, id: string, personToUpdate: Partial<Person>): Promise<void> => {
    try {
        const now = new Date().toLocaleString('pt-BR');
        const updated = {
            ...personToUpdate,
            updatedAt: now
        }
        await setDoc(doc(db, collectionName, id), updated, { merge: true });
    } catch (error) {
        console.error(`Erro ao atualizar em ${collectionName}: `, error);
        throw error;
    }
};

export const moveToTrash = async (collectionName: string, id: string): Promise<void> => {
    try {
        await updatePerson(collectionName, id, { 
            deleted: true, 
            deletedAt: new Date().toLocaleString('pt-BR'),
            active: false
        });
    } catch (error) {
        console.error(`Erro ao mover para lixeira em ${collectionName}: `, error);
        throw error;
    }
};

export const restorePerson = async (collectionName: string, id: string): Promise<void> => {
    try {
        await updatePerson(collectionName, id, { 
            deleted: false,
            deletedAt: undefined,
            active: true
        });
    } catch (error) {
        console.error(`Erro ao restaurar em ${collectionName}: `, error);
        throw error;
    }
};

export const permanentDeletePerson = async (collectionName: string, id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error(`Erro ao deletar permanentemente em ${collectionName}: `, error);
        throw error;
    }
};
