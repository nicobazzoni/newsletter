// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCUZINFneDCyZO4czVDRB-LOWsFpxviLJ8",
  authDomain: "newsletter-70c87.firebaseapp.com",
  projectId: "newsletter-70c87",
  storageBucket: "newsletter-70c87.firebasestorage.app",
  messagingSenderId: "1028824468366",
  appId: "1:1028824468366:web:714e2c979999314c90b2df"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);