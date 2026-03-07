import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 * @param file The file to upload.
 * @param path The path in storage (e.g., 'products/image.jpg').
 * @returns A promise that resolves to the download URL.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file to storage:", error);
        throw error;
    }
};
