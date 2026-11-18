// ============================================================
// js/auth.js
// Funções reutilizadas por todas as páginas do site.
// ============================================================

import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Espera o Firebase decidir se existe usuário logado.
 * Retorna o objeto `user` ou `null`. Use sempre isto em vez de
 * `auth.currentUser`, que no primeiro instante da página ainda é null.
 */
export function esperarUsuario() {
  return new Promise((resolve) => {
    const parar = onAuthStateChanged(auth, (user) => {
      parar();
      resolve(user);
    });
  });
}

/**
 * Bloqueia a página se ninguém estiver logado.
 * Uso: const user = await exigirLogin();
 */
export async function exigirLogin(paginaLogin = "cadastro.html") {
  const user = await esperarUsuario();
  if (!user) {
    window.location.href = paginaLogin + "?redirect=" +
      encodeURIComponent(window.location.pathname.split("/").pop());
    return null;
  }
  return user;
}

/** Lê o documento de perfil em usuarios/{uid}. */
export async function carregarPerfil(uid) {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? snap.data() : null;
}

export function sair() {
  return signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

/**
 * Troca o link "Login" do menu por "Olá, Fulano | Sair" quando
 * há sessão ativa. Basta o link ter id="link-login".
 */
export function montarMenuUsuario() {
  onAuthStateChanged(auth, async (user) => {
    const link = document.getElementById("link-login");
    if (!link) return;
    const li = link.parentElement;

    if (!user) {
      link.textContent = "Login";
      link.href = "cadastro.html";
      return;
    }

    const perfil = await carregarPerfil(user.uid);
    const nome = (perfil?.nome || user.email).split(" ")[0];

    link.textContent = nome;
    link.href = "perfil.html";

    if (!document.getElementById("link-sair")) {
      const novo = document.createElement("li");
      novo.innerHTML = '<a href="#" id="link-sair">Sair</a>';
      li.insertAdjacentElement("afterend", novo);
      novo.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        sair();
      });
    }
  });
}
