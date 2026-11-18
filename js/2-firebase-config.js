// ============================================================
// js/firebase-config.js
// Inicializa o Firebase (Auth + Firestore) para todo o site.
// ------------------------------------------------------------
// COLE AQUI o objeto que o Console do Firebase te mostrou em:
// Configurações do projeto > Seus apps > App da Web > SDK setup
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlVvGriZR7nUosiFBv2XMaTRDVK-eV8zs",
  authDomain: "tech-for-all-e35c1.firebaseapp.com",
  projectId: "tech-for-all-e35c1",
  storageBucket: "tech-for-all-e35c1.firebasestorage.app",
  messagingSenderId: "794210262505",
  appId: "1:794210262505:web:454244906e98910763bf78"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
