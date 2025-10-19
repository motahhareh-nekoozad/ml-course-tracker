// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// ===== جایگذاری اطلاعات پروژه خود =====
const firebaseConfig = {
  apiKey: "AIzaSyDiO2SxrY952Bwe-H7b79_YONzd63GfpHI",
  authDomain: "ml-course-tracker.firebaseapp.com",
  projectId: "ml-course-tracker",
  storageBucket: "ml-course-tracker.firebasestorage.app",
  messagingSenderId: "1046275890271",
  appId: "1:1046275890271:web:6ce13dc7db88bc7b294fea",
  measurementId: "G-PR146WN85V"
};
// ========================================

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// فعال کردن persistence برای جلوگیری از خطای Offline
enableIndexedDbPersistence(db)
  .then(() => console.log("Persistence enabled ✅"))
  .catch((err) => {
    console.log("Persistence error", err.code);
  });

console.log("Firebase initialized ✅");
