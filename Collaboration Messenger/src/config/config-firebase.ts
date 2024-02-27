import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBggsvmNAyCzR0OYDMIOwnxlJsBwrLEENU",
  authDomain: "messageapp-240b7.firebaseapp.com",
  databaseURL: "https://messageapp-240b7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "messageapp-240b7",
  storageBucket: "messageapp-240b7.appspot.com",
  messagingSenderId: "732838126515",
  appId: "1:732838126515:web:589d73f3cfb87a7885a1c6",
  dataBaseURL: "https://messageapp-240b7-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);