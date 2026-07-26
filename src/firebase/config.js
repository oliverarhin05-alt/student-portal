import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDscU0gk_DRFlNa63P9wJLBdscE58e-kOg",
  authDomain: "basic-school-portal.firebaseapp.com",
  projectId: "basic-school-portal",
  storageBucket: "basic-school-portal.firebasestorage.app",
  messagingSenderId: "297741342527",
  appId: "1:297741342527:web:a30c6df6fdcb8b3566a58a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);