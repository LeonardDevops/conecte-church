// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcc8YY-ugQa_adDneFqlV3CYrZ2gmAxp0",
  authDomain: "igrejameta-80236.firebaseapp.com",
  projectId: "igrejameta-80236",
  storageBucket: "igrejameta-80236.firebasestorage.app",
  messagingSenderId: "509734766303",
  appId: "1:509734766303:web:fc98082f897134f99f4b6a",
  measurementId: "G-S0HNLLB9DH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Export everything
export { app, auth, db, storage };
export default app;