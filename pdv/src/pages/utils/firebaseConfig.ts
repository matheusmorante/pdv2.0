import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAdctqX5wD5CFASKR4FwDXSMVtq3sAXXRE",
    authDomain: "meupdv-6c418.firebaseapp.com",
    projectId: "meupdv-6c418",
    storageBucket: "meupdv-6c418.firebasestorage.app",
    messagingSenderId: "541022607",
    appId: "1:541022607:web:82b84b17d65c852e2213fa",
    measurementId: "G-1GM9K7W24F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
