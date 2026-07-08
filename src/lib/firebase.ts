import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiyI454ylrMchKQX3wcnKJ2ZTxgZop0Bg",
  authDomain: "charming-network-q8gvj.firebaseapp.com",
  projectId: "charming-network-q8gvj",
  storageBucket: "charming-network-q8gvj.firebasestorage.app",
  messagingSenderId: "484605313959",
  appId: "1:484605313959:web:4b20ff5cd7f7361bee6c82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
