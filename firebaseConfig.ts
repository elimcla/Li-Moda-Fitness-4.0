
// Use correct imports from firebase/app and firebase/firestore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbke-BtvwsFeJMNFQUuF8jJqxE-u2MBOM",
  authDomain: "limodafitness.firebaseapp.com",
  projectId: "limodafitness",
  storageBucket: "limodafitness.firebasestorage.app",
  messagingSenderId: "501327863405",
  appId: "1:501327863405:web:9ad1b67e222ddd8253a964"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);