# 🤖 Codara AI

Aplicação web de análise inteligente de código desenvolvida com React e TypeScript, permitindo ao usuário colar ou escrever código e receber uma análise completa gerada por inteligência artificial, com erros encontrados, sugestões, melhorias e código corrigido. O projeto conta com autenticação segura, histórico de chats, sistema de patches e interface totalmente responsiva.

O projeto foi desenvolvido com foco em boas práticas de arquitetura frontend, organização escalável por features e integração com backend via BaaS.

🔗 Deploy: https://codara-ai.vercel.app/ <br>
🔗 Repositório: https://github.com/hubdanielcode/Codara-AI

---

## 🚀 Demonstração

O sistema permite:

- Análise de código com IA — erros, sugestões, melhorias e código corrigido
- Cadastro e autenticação de usuários
- Histórico de chats com análises anteriores
- Sistema de patches para rastrear análises por chat
- Foto de perfil com recorte de imagem
- Suporte a tema claro e escuro
- Persistência de sessão
- Interface responsiva para desktop, mobile e landscape

---

## 🏗️ Arquitetura e Decisões Técnicas

O projeto foi estruturado seguindo o padrão de organização por features, promovendo escalabilidade e separação de responsabilidades:

    features/authentication
    features/code-review
    shared

**Principais decisões técnicas:**

- Separação clara entre lógica, UI, pages, services e types dentro de cada feature
- Context API para gerenciamento de estado global (autenticação, code review, chat, tema)
- Camada de services para comunicação com o Supabase
- Hooks customizados organizados por domínio
- Providers centralizados em `shared/providers`
- Estrutura preparada para crescimento e manutenção futura

---

## 🔐 Autenticação

Implementada com Supabase utilizando:

- Registro e login com e-mail e senha
- Autenticação baseada em JWT
- Persistência automática de sessão
- Proteção de rotas privadas
- Isolamento de dados por usuário autenticado

Cada usuário visualiza e gerencia exclusivamente seus próprios chats e análises.

---

## 🧠 Integração com IA

A análise é feita pelo modelo **GPT-OSS 120B**, chamado pela API da **Groq**. O prompt define o papel de revisor de código sênior, pede para não inventar problemas e exige uma resposta em JSON com quatro campos fixos: `errors`, `suggestions`, `improvements` e `corrected_code`. A temperatura é 0, para deixar as respostas mais consistentes. A IA também gera o título de cada conversa.

**Fluxo da requisição:**

    Navegador ──(prompt + token do usuário)──► /api/ai (função serverless na Vercel) ──(chave da Groq)──► Groq

- A chave da Groq (`GROQ_API_KEY`) existe **só no servidor**. Ela nunca vai para o bundle do navegador.
- A função `api/ai.ts` só atende usuários logados: ela confere o token com o Supabase antes de chamar a IA.
- O prompt tem limite de tamanho e os erros da Groq são registrados no servidor, sem expor detalhes ao cliente.
- No front-end, a resposta da IA é validada (`parseReview`): o JSON é extraído mesmo se vier dentro de markdown, os quatro campos são conferidos e qualquer resposta fora do formato vira uma mensagem de erro clara.

---

## ⚙️ Funcionalidades

✔ Cadastro e autenticação de usuários  
✔ Análise de código com IA  
✔ Detecção de erros no código  
✔ Sugestões de boas práticas  
✔ Melhorias de performance e legibilidade  
✔ Código corrigido gerado automaticamente  
✔ Histórico de chats por usuário  
✔ Sistema de patches por análise  
✔ Upload e recorte de foto de perfil  
✔ Tema claro e escuro  
✔ Sidebar com navegação entre chats  
✔ Modal de renomear e deletar chats  
✔ Páginas institucionais (Política de Privacidade, Termos de Uso)  
✔ Página 404 personalizada  
✔ Testes automatizados com Vitest e React Testing Library  
✔ Conexão direta com banco de dados real via Supabase

---

## 🧪 Testes

O projeto conta com uma suíte de testes automatizados cobrindo os principais componentes, hooks, serviços e utilitários:

- **Authentication** — AuthenticationContext, useAuthenticationContext, pages (Authentication, Login, ProtectedRoute, RecoverPassword), authenticationService
- **Code Review** — ChatContext, CodeReviewContext, MessageContext, PatchContext, hooks de chat/code-review/message/patch, MainPage, services (chat, codeReview, message, patch)
- **API** — função serverless `api/ai.ts` (autenticação, validação, erros da Groq)
- **Shared** — ThemeContext, useThemeContext, pages (Missing, PrivacyPolicy, TermsOfUse), AppProviders, UI (ChatDeleteModal, ChatTitleModal, Footer, Header, PhotoCropModal, SideBar), utils (masks, regex, sideBarIcons, theme)

Os testes utilizam `renderHook` para hooks e mocks do Supabase para isolamento de dependências externas.

---

## 🛠️ Tecnologias Utilizadas

- React (Vite)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router DOM
- Supabase (Autenticação e Banco de Dados)
- Groq API (GPT-OSS 120B) via função serverless na Vercel
- Monaco Editor
- React Image Crop
- Lucide React + React Icons
- Vitest + React Testing Library
- Vercel (Deploy e hospedagem)
- Git & GitHub

---

## ▶️ Executando Localmente

Clone o repositório:

    git clone https://github.com/hubdanielcode/Codara-AI.git
    cd Codara-AI

Instale as dependências:

    npm install

Crie um arquivo `.env` (use o `.env.example` como modelo):

    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    GROQ_API_KEY=your_groq_key

> `GROQ_API_KEY` **não** tem o prefixo `VITE_` de propósito: variáveis com esse prefixo vão para o navegador. No `npm run dev`, o Vite serve a rota `/api/ai` com o mesmo código que roda na Vercel.
>
> Em produção, cadastre `GROQ_API_KEY` em **Settings > Environment Variables** do projeto na Vercel.

Execute a aplicação:

    npm run dev

Acesse no navegador:

    http://localhost:5173

Execute os testes:

    npm run test

---

## 🧠 Conceitos Aplicados

- Componentização e reutilização de UI
- Organização escalável por features
- Gerenciamento de estado com Hooks e Context API
- Autenticação JWT com Supabase
- Integração com Backend as a Service (BaaS)
- Persistência de sessão
- Integração segura com IA (chave no servidor, função serverless autenticada)
- Validação da resposta de um modelo de linguagem
- Upload e recorte de imagens
- Testes automatizados de componentes, hooks e serviços
- Boas práticas de estruturação de projeto frontend

---

## 📂 Estrutura do Projeto

    Codara-AI/
    ├── api/
    │   └── ai.ts
    │
    ├── public/
    │
    ├── src/
    │   ├── features/
    │   │   ├── authentication/
    │   │   │   ├── context/
    │   │   │   │   └── AuthenticationContext.tsx
    │   │   │   │
    │   │   │   ├── hooks/
    │   │   │   │   └── useAuthenticationContext.ts
    │   │   │   │
    │   │   │   ├── pages/
    │   │   │   │   ├── Authentication.tsx
    │   │   │   │   ├── Login.tsx
    │   │   │   │   ├── ProtectedRoute.tsx
    │   │   │   │   └── RecoverPassword.tsx
    │   │   │   │
    │   │   │   ├── services/
    │   │   │   │   └── authenticationService.ts
    │   │   │   │
    │   │   │   ├── types/
    │   │   │   │   └── user.ts
    │   │   │   │
    │   │   │   └── index.ts
    │   │   │
    │   │   └── code-review/
    │   │       ├── context/
    │   │       │   ├── ChatContext.tsx
    │   │       │   ├── CodeReviewContext.tsx
    │   │       │   ├── MessageContext.tsx
    │   │       │   ├── OutletContext.tsx
    │   │       │   └── PatchContext.tsx
    │   │       │
    │   │       ├── hooks/
    │   │       │   ├── useChatContext.ts
    │   │       │   ├── useCodeReviewContext.ts
    │   │       │   ├── useMessageContext.ts
    │   │       │   └── usePatchContext.ts
    │   │       │
    │   │       ├── pages/
    │   │       │   └── MainPage.tsx
    │   │       │
    │   │       ├── services/
    │   │       │   ├── chatService.ts
    │   │       │   ├── codeReviewService.ts
    │   │       │   ├── messageService.ts
    │   │       │   └── patchService.ts
    │   │       │
    │   │       ├── types/
    │   │       │   ├── chat.ts
    │   │       │   ├── codeReview.ts
    │   │       │   ├── message.ts
    │   │       │   └── patch.ts
    │   │       │
    │   │       └── index.ts
    │   │
    │   ├── shared/
    │   │   ├── context/
    │   │   │   └── ThemeContext.tsx
    │   │   │
    │   │   ├── hooks/
    │   │   │   ├── useOutletContext.ts
    │   │   │   └── useThemeContext.ts
    │   │   │
    │   │   ├── pages/
    │   │   │   ├── Missing.tsx
    │   │   │   ├── PrivacyPolicy.tsx
    │   │   │   └── TermsOfUse.tsx
    │   │   │
    │   │   ├── providers/
    │   │   │   └── AppProviders.tsx
    │   │   │
    │   │   ├── ui/
    │   │   │   ├── ChatDeleteModal.tsx
    │   │   │   ├── ChatTitleModal.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Header.tsx
    │   │   │   ├── PhotoCropModal.tsx
    │   │   │   └── SideBar.tsx
    │   │   │
    │   │   ├── utils/
    │   │   │   ├── masks.ts
    │   │   │   ├── regex.ts
    │   │   │   ├── sideBarIcons.ts
    │   │   │   └── theme.ts
    │   │   │
    │   │   └── index.ts
    │   │
    │   ├── supabase/
    │   │   └── supabase.ts
    │   │
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    │
    ├── tests/
    │   ├── features/
    │   │   ├── authentication/
    │   │   │   ├── context/
    │   │   │   │   └── AuthenticationContext.test.tsx
    │   │   │   │
    │   │   │   ├── hooks/
    │   │   │   │   └── useAuthenticationContext.test.ts
    │   │   │   │
    │   │   │   ├── pages/
    │   │   │   │   ├── Authentication.test.tsx
    │   │   │   │   ├── Login.test.tsx
    │   │   │   │   ├── ProtectedRoute.test.tsx
    │   │   │   │   └── RecoverPassword.test.tsx
    │   │   │   │
    │   │   │   └── services/
    │   │   │       └── authenticationService.test.ts
    │   │   │
    │   │   └── code-review/
    │   │       ├── context/
    │   │       │   ├── ChatContext.test.tsx
    │   │       │   ├── CodeReviewContext.test.tsx
    │   │       │   ├── MessageContext.test.tsx
    │   │       │   └── PatchContext.test.tsx
    │   │       │
    │   │       ├── hooks/
    │   │       │   ├── useChatContext.test.ts
    │   │       │   ├── useCodeReviewContext.test.ts
    │   │       │   ├── useMessageContext.test.ts
    │   │       │   └── usePatchContext.test.ts
    │   │       │
    │   │       ├── pages/
    │   │       │   └── MainPage.test.tsx
    │   │       │
    │   │       └── services/
    │   │           ├── chatService.test.ts
    │   │           ├── codeReviewService.test.ts
    │   │           ├── messageService.test.ts
    │   │           └── patchService.test.ts
    │   │
    │   ├── shared/
    │   │   ├── context/
    │   │   │   └── ThemeContext.test.tsx
    │   │   │
    │   │   ├── hooks/
    │   │   │   └── useThemeContext.test.ts
    │   │   │
    │   │   ├── pages/
    │   │   │   ├── Missing.test.tsx
    │   │   │   ├── PrivacyPolicy.test.tsx
    │   │   │   └── TermsOfUse.test.tsx
    │   │   │
    │   │   ├── providers/
    │   │   │   └── AppProviders.test.tsx
    │   │   │
    │   │   └── ui/
    │   │       ├── ChatDeleteModal.test.tsx
    │   │       ├── ChatTitleModal.test.tsx
    │   │       ├── Footer.test.tsx
    │   │       ├── Header.test.tsx
    │   │       ├── PhotoCropModal.test.tsx
    │   │       └── SideBar.test.tsx
    │   │
    │   └── setup.ts
    │
    ├── .env
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts

---

## 🌍 Deploy

O projeto está publicado na Vercel, garantindo:

- Deploy automático via GitHub
- Build otimizado para produção
- Ambiente seguro com variáveis de ambiente configuradas no painel da Vercel

---

## 📱 Responsividade

A aplicação possui adaptação completa para:

- **Desktop** — layout padrão com split view de código e análise
- **Mobile portrait** — layout em coluna com scroll
- **Mobile landscape** — layout otimizado para orientação horizontal

---

## 📌 Observações

- Os dados são vinculados ao usuário autenticado
- Cada usuário gerencia exclusivamente seus próprios chats e análises
- As variáveis de ambiente do Supabase são obrigatórias para o funcionamento local

---

## 📄 Licença

Este projeto é livre para fins de estudo, aprendizado e uso pessoal.
