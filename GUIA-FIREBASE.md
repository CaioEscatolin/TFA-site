# Guia passo a passo — Firebase no projeto Tech For All

Este guia leva você do zero até o site salvando cadastros, logins e respostas do formulário.
Não é preciso saber backend: o Firebase é o servidor e o banco.

**O que vamos usar:**

| Serviço | Para quê |
|---|---|
| Firebase Authentication | Criar conta, fazer login, recuperar senha |
| Cloud Firestore | Guardar o perfil e as respostas do formulário |
| Firebase Hosting (opcional) | Publicar o site com endereço próprio |

---

## Parte 1 — Criar o projeto no Firebase

### Passo 1. Entrar no console
1. Abra <https://console.firebase.google.com>.
2. Faça login com uma conta Google (pode ser o Gmail pessoal).

### Passo 2. Criar o projeto
1. Clique em **Criar um projeto** (ou *Add project*).
2. Nome: `tech-for-all` (o Firebase vai gerar um ID parecido, tipo `tech-for-all-4a19f` — anote esse ID).
3. Em **Google Analytics**, pode **desativar**. Não é necessário para o trabalho e deixa o processo mais rápido.
4. Clique em **Criar projeto** e espere o carregamento terminar.

### Passo 3. Registrar o app da Web
Isso é o que gera as chaves que o site usa.

1. Na tela inicial do projeto, procure o ícone **`</>`** (Web), logo abaixo de "Comece adicionando o Firebase ao seu app".
2. Apelido do app: `site-tfa`.
3. **Não** marque "Configurar também o Firebase Hosting" agora (fazemos depois, na Parte 6).
4. Clique em **Registrar app**.
5. A tela seguinte mostra um bloco de código com o objeto `firebaseConfig`. **Copie esse bloco inteiro** — ele tem `apiKey`, `authDomain`, `projectId`, etc.

> Se fechar a tela sem copiar: ⚙️ **Configurações do projeto** → aba **Geral** → role até **Seus apps** → **Configuração do SDK** → opção **Config**.

> **Essas chaves são públicas por natureza.** Qualquer pessoa consegue vê-las no navegador, e está tudo bem — quem protege os dados são as *regras de segurança* do Passo 6, não a chave.

---

## Parte 2 — Ativar o Authentication (login/cadastro)

### Passo 4
1. No menu lateral: **Criação** (*Build*) → **Authentication**.
2. Clique em **Vamos começar** / *Get started*.
3. Aba **Sign-in method** → na lista de provedores, clique em **E-mail/senha**.
4. Ligue a primeira chave (**Ativar**). A segunda (*link de e-mail sem senha*) pode ficar desligada.
5. **Salvar**.

Pronto — a partir de agora o Firebase aceita `createUserWithEmailAndPassword` e `signInWithEmailAndPassword`.

> A aba **Users** dessa mesma tela é onde você verá cada pessoa cadastrada, com UID e data. Use-a para conferir se o cadastro funcionou.

---

## Parte 3 — Criar o banco de dados (Cloud Firestore)

### Passo 5
1. Menu lateral: **Criação** → **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. **Modo**: escolha **Iniciar no modo de produção** (bloqueado por padrão). Vamos abrir só o necessário no próximo passo.
   - *Modo de teste* também funciona, mas libera tudo para qualquer um durante 30 dias e depois trava o site sem aviso. Evite.
4. **Local (região)**: escolha `southamerica-east1 (São Paulo)`. **Essa escolha é permanente** — não dá para mudar depois sem recriar o banco.
5. **Ativar**.

### Passo 6. Colar as regras de segurança
1. Dentro do Firestore, abra a aba **Regras** (*Rules*).
2. Apague o conteúdo e cole o que está no arquivo `firestore.rules` do projeto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /respostas/{respostaId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publicar**.

**O que essas regras dizem, em português:** só quem está logado pode ler/escrever, e apenas dentro da pasta cujo nome é o próprio UID. Ninguém consegue ler o perfil ou as respostas de outra pessoa, nem pelo console do navegador.

### Estrutura de dados que o site vai criar

```
usuarios (coleção)
└── AbC123uidDoUsuario (documento)
    ├── nome: "Ana Souza"
    ├── email: "ana@email.com"
    ├── criadoEm: 12/05/2026 14:30
    ├── ultimoLogin: 18/05/2026 09:12
    ├── respostasEnviadas: 2
    └── respostas (subcoleção)
        └── xY9kd0... (documento)
            ├── idade: 28
            ├── deficiencias: ["visual", "tdah"]
            ├── usos: ["estudo", "trabalho"]
            ├── dispositivos: ["fone", "teclado"]
            ├── dificuldade: "textos muito pequenos"
            └── enviadoEm: 18/05/2026 09:15
```

Você **não precisa criar nada disso na mão**. O Firestore cria coleções e documentos automaticamente na primeira gravação.

---

## Parte 4 — Colocar as chaves no projeto

### Passo 7
1. Abra o arquivo **`js/firebase-config.js`** (já vem pronto na pasta do projeto).
2. Substitua o objeto `firebaseConfig` pelo que você copiou no Passo 3. Deve ficar assim:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD...sua-chave-real",
  authDomain: "tech-for-all-4a19f.firebaseapp.com",
  projectId: "tech-for-all-4a19f",
  storageBucket: "tech-for-all-4a19f.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

3. Salve. **É o único arquivo que você precisa editar.**

---

## Parte 5 — Rodar e testar

### Passo 8. Abrir o site num servidor local
⚠️ **Dar dois cliques no `index.html` não vai funcionar.** O projeto usa `<script type="module">`, e o navegador bloqueia módulos no endereço `file:///`. O Firebase Auth também exige `localhost` ou `https`.

**Jeito mais fácil (VS Code):**
1. Instale a extensão **Live Server** (autor: Ritwick Dey).
2. Clique com o botão direito em `index.html` → **Open with Live Server**.
3. O site abre em `http://127.0.0.1:5500`.

**Alternativa sem VS Code** — no terminal, dentro da pasta do projeto:
```bash
python -m http.server 5500
```
e abra `http://localhost:5500`.

### Passo 9. Testar o cadastro
1. Clique em **Login** no menu → **Criar uma conta**.
2. Preencha nome, e-mail e uma senha de **no mínimo 6 caracteres** (regra do Firebase).
3. Enviar.
4. Confira no console: **Authentication → Users** (aparece o e-mail) e **Firestore → usuarios** (aparece o documento com nome e datas).

### Passo 10. Testar o login e o que fica salvo
1. Volte para `cadastro.html` e entre com o mesmo e-mail e senha.
2. Repare que o menu agora mostra o seu **primeiro nome** e um link **Sair**.
3. Vá em **Formulário**, responda os 4 passos e envie.
4. No console → **Firestore** → `usuarios` → seu UID → subcoleção `respostas`: o documento está lá.
5. Clique no seu nome no menu para abrir **`perfil.html`** e ver os dados e o histórico de respostas.
6. Feche o navegador, abra de novo em `localhost`: você continua logado (é o "Lembrar neste dispositivo").

### Passo 11. Testar a recuperação de senha
Na tela de login, digite o e-mail no campo e clique em **Esqueceu a senha?**. O Firebase envia o link de redefinição sozinho (confira o spam).

---

## Parte 6 — Publicar o site (opcional, mas recomendado)

Enquanto o site roda só em `localhost`, ninguém mais consegue acessar. Para publicar de graça:

### Passo 12
1. Instale o Node.js (<https://nodejs.org>) se ainda não tiver.
2. No terminal:

```bash
npm install -g firebase-tools
firebase login
cd caminho/para/Extensao-TFA
firebase init hosting
```

3. Nas perguntas do `init`:
   - *Use an existing project* → escolha seu projeto.
   - *What do you want to use as your public directory?* → digite **`.`** (ponto) — o site está na raiz.
   - *Configure as a single-page app?* → **No**.
   - *Set up automatic builds with GitHub?* → **No**.
   - Se perguntar se quer sobrescrever `index.html` → **No** (muito importante).
4. Publique:

```bash
firebase deploy --only hosting
```

5. O terminal devolve o endereço final: `https://seu-projeto.web.app`.

### Passo 13. Autorizar o domínio
No console: **Authentication → Settings → Domínios autorizados**. Os domínios `.web.app` e `localhost` já vêm liberados. Se você usar domínio próprio, adicione-o aqui, senão o login falha com `auth/unauthorized-domain`.

---

## Como o código está organizado

| Arquivo | Papel |
|---|---|
| `js/firebase-config.js` | Único lugar com as chaves; inicializa Auth e Firestore |
| `js/auth.js` | `exigirLogin()`, `carregarPerfil()`, `sair()` e o menu que muda quando há sessão |
| `cadastro.html` | Cadastro, login, "lembrar neste dispositivo" e redefinição de senha |
| `pesquisa.html` | Exige login e grava as respostas em `usuarios/{uid}/respostas` |
| `perfil.html` | Página protegida: mostra o perfil, permite trocar o nome e lista as respostas |
| `firestore.rules` | Cópia das regras para colar no console |

Para proteger qualquer outra página nova, basta isto no final do HTML:

```html
<script type="module">
  import { exigirLogin, montarMenuUsuario } from "./js/auth.js";
  montarMenuUsuario();
  const user = await exigirLogin();   // quem não estiver logado vai para o cadastro
</script>
```

---

## Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| Página em branco, console diz `CORS` ou `blocked by origin 'null'` | Você abriu com duplo clique. Use o Live Server (Passo 8). |
| `Firebase: Error (auth/configuration-not-found)` | O provedor E-mail/senha não foi ativado. Refaça o Passo 4. |
| `auth/api-key-not-valid` | A config foi colada errada ou está incompleta. Recopie do console. |
| `Missing or insufficient permissions` | As regras não foram publicadas, ou você está tentando ler dados de outro UID. Revise o Passo 6. |
| `auth/weak-password` | Senha com menos de 6 caracteres. O texto da tela diz 8, mas o mínimo do Firebase é 6. |
| Cadastro funciona, mas nada aparece no Firestore | O banco não foi criado (Passo 5) ou a região ficou pendente. |
| `auth/unauthorized-domain` | Adicione o domínio em Authentication → Settings (Passo 13). |

---

## Um cuidado com dados sensíveis

O formulário coleta informações sobre deficiência, que são **dados pessoais sensíveis** pela LGPD. Para um trabalho acadêmico as regras acima já são adequadas (cada pessoa só acessa o que é seu). Se o site for mesmo ao ar com usuários reais, vale escrever uma política de privacidade explicando o que é coletado e por quê, e por que os "Termos de Serviço" da tela de cadastro precisam apontar para um texto real.
