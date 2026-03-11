import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBeuE-9Nwtzq4XmeCL4sCZQwYXCsAIHsbs",
    authDomain: "studygenie-e6bcd.firebaseapp.com",
    projectId: "studygenie-e6bcd",
    storageBucket: "studygenie-e6bcd.firebasestorage.app",
    messagingSenderId: "392279706886",
    appId: "1:392279706886:web:319ca2a75d74f42f3d6287",
    measurementId: "G-LP5VWRENND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
