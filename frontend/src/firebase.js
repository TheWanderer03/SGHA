import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyBSEb43K1lkjDVOGLHTaLgHMlT1lCW_FxY",
  authDomain: "sgca-6bf3a.firebaseapp.com",
  projectId: "sgca-6bf3a",
  databaseURL: "https://sgca-6bf3a-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "sgca-6bf3a.firebasestorage.app",
  messagingSenderId: "261593169285",
  appId: "1:261593169285:web:dfe277b555799f0b59d8ec",
  measurementId: "G-5PRF6F4G1E"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
export { ref, onValue, set, push };
