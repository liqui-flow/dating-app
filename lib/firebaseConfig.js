// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5j_G0m19mJ8BXThoOemQKi5IwdP84u4M",
  authDomain: "dating-app-1525c.firebaseapp.com",
  projectId: "dating-app-1525c",
  storageBucket: "dating-app-1525c.firebasestorage.app",
  messagingSenderId: "1098926714809",
  appId: "1:1098926714809:web:6c811c8bf5a295068",
  measurementId: "G-6SH7TL086M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);