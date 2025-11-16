// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCTSe8wfvULQYbsGyXEgrJD1yOgGkTWkhw",
    authDomain: "login-system-114fe.firebaseapp.com",
    projectId: "login-system-114fe",
    storageBucket: "login-system-114fe.firebasestorage.app",
    messagingSenderId: "132443361016",
    appId: "1:132443361016:web:8a731a75fc1406b9be750d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth
export const auth = getAuth(app);
// Initialize and export Firestore
export const db = getFirestore(app);