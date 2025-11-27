// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8DReInpGU3D0WXv8PHzi3iort41_E6ZY",
  authDomain: "studio-9309129508-edeb4.firebaseapp.com",
  projectId: "studio-9309129508-edeb4",
  storageBucket: "studio-9309129508-edeb4.firebasestorage.app",
  messagingSenderId: "211568479190",
  appId: "1:211568479190:web:4425aec88fc2972d0b7277"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function fetchFaqs() {
  const faqsCol = collection(db, "faqs");
  const snapshot = await getDocs(faqsCol);
  return snapshot.docs.map(doc => doc.data());
}
