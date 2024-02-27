import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

/**
 * Firebase configuration object.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD1VIi7cSYs-MGQTBai7xyxmlUK9Pzt-NU",
  authDomain: "tripify-375f2.firebaseapp.com",
  projectId: "tripify-375f2",
  storageBucket: "tripify-375f2.appspot.com",
  messagingSenderId: "984030549158",
  appId: "1:984030549158:web:737cd48390d95aa1215067",
  databaseURL: "https://messageapp-240b7-default-rtdb.europe-west1.firebasedatabase.app/"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);