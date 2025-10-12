# ✅ Como Testar o Sistema - Guia Passo a Passo

## 🚀 **SISTEMA COMPLETO RODANDO!**

Você tem agora **3 aplicações** funcionando:
- ✅ **Backend API** (NestJS + Fastify)
- ✅ **Student Portal** (React + Material UI)  
- ✅ **Admin Portal** (React + Material UI)

---

## 📍 **URLs e Portas:**

| Serviço | URL | O que faz |
|---------|-----|-----------|
| **Backend API** | http://localhost:3000/api | API REST com todos os endpoints |
| **Swagger Docs** | http://localhost:3000/api/docs | Documentação interativa da API |
| **Student Portal** | http://localhost:4200 | Portal para alunos e responsáveis |
| **Admin Portal** | http://localhost:4201 | Portal administrativo |
| **PostgreSQL** | localhost:5432 | Banco de dados |
| **pgAdmin** | http://localhost:5050 | Interface web do PostgreSQL |

---

## ⚠️ **Se Estiver Vendo Página em Branco:**

### Causa Comum: Cache do Navegador

**SOLUÇÃO RÁPIDA:**
```
1. Pressione Ctrl + Shift + R (Windows/Linux)
   ou Cmd + Shift + R (Mac)
   
2. Ou abra em modo anônimo:
   Ctrl + Shift + N

3. Ou limpe o cache:
   F12 → Console → Clique com botão direito no ícone de reload → "Empty Cache and Hard Reload"
```

### Verificar se tem erros:
```
1. Abra http://localhost:4200
2. Pressione F12 (DevTools)
3. Vá na aba "Console"
4. Veja se tem erros em vermelho
5. Me envie os erros se houver
```

---

## 🎯 **Como Acessar Cada Portal:**

### 1. Student Portal (http://localhost:4200)

**O que você deve ver:**
```
┌─────────────────────────────────┐
│ [🏠] Student Portal      [☀️] │  ← Top bar
├─────────────────────────────────┤
│                                 │
│    🥋 Gym Management            │
│                                 │
│    Welcome to your training     │
│    dashboard!                   │
│                                 │
│   [Go to Dashboard]  [Login]    │
│                                 │
└─────────────────────────────────┘
```

**Ações:**
- Clique no ícone ☀️ (sol) → Vira dark mode 🌙
- Clique em "Go to Dashboard" → Ver página do dashboard
- Clique em "Login" → Ver página de login

---

### 2. Admin Portal (http://localhost:4201)

**O que você deve ver:**
```
┌────────────────────────────────┐
│                                │
│   🔐 Admin Portal              │
│                                │
│   Gym Management System        │
│                                │
│   [Toggle Dark Mode]           │
│                                │
│   Admin Portal is working!     │
│                                │
└────────────────────────────────┘
```

**Ações:**
- Clique em "Toggle Dark Mode" → Troca entre claro/escuro
- Veja o fundo mudar

---

### 3. Swagger (http://localhost:3000/api/docs)

**O que você deve ver:**
```
╔═══════════════════════════════════╗
║  Gym Management API               ║
║  Version 1.0                      ║
╠═══════════════════════════════════╣
║  ▶ health                         ║
║  ▶ auth                          ║
║  ▶ students                      ║
║  ▶ guardians                     ║
║  ▶ enrollments                   ║
║  ▶ graduations                   ║
║  ▶ financial                     ║
║  ▶ products                      ║
╚═══════════════════════════════════╝
```

**Ações:**
- Expanda "auth" → Veja endpoints de autenticação
- Clique em "POST /api/auth/register" → Try it out
- Teste criar um usuário
- Pegue o token e use no "Authorize"

---

## 🧪 **Teste Completo (5 minutos):**

### Passo 1: Verificar se está tudo rodando
```bash
# Abra um terminal e rode:
cd /home/rafaelreis/projects/personal/gym-management

# Verifique os processos:
ps aux | grep "nx serve\|node.*api"

# Deve mostrar:
# - nx serve student-portal
# - nx serve admin-portal (se rodou pnpm dev:admin)
# - node (API se rodou pnpm dev)
```

### Passo 2: Testar Backend
```bash
# Teste health check
curl http://localhost:3000/api/health

# Deve retornar:
# {"status":"ok","timestamp":"...","uptime":...}

# Se não funcionar, rode:
pnpm dev
```

### Passo 3: Testar Student Portal
```bash
# Abra no navegador
open http://localhost:4200

# OU teste via curl
curl http://localhost:4200

# Se não funcionar, rode:
pnpm dev:student

# Aguarde aparecer:
# "➜  Local:   http://localhost:4200/"
```

### Passo 4: Testar Admin Portal
```bash
# Abra no navegador
open http://localhost:4201

# OU teste via curl
curl http://localhost:4201

# Se não funcionar, rode:
pnpm dev:admin

# Aguarde aparecer:
# "➜  Local:   http://localhost:4201/"
```

---

## 🔧 **Se Nada Funcionar - Reset Total:**

```bash
# 1. Parar TUDO
pkill -9 node
docker compose down

# 2. Limpar TUDO
rm -rf .nx dist node_modules
find apps libs -type d -name "node_modules" -exec rm -rf {} +

# 3. Reinstalar
pnpm install

# 4. Subir Docker
docker compose up -d

# 5. Subir serviços (3 terminais separados)

# Terminal 1:
pnpm dev

# Terminal 2:
pnpm dev:student

# Terminal 3:
pnpm dev:admin

# 6. Aguardar 30 segundos

# 7. Testar:
open http://localhost:3000/api/docs
open http://localhost:4200
open http://localhost:4201
```

---

## ✅ **Checklist Final:**

- [ ] Docker rodando: `docker compose ps`
- [ ] API rodando: `curl http://localhost:3000/api/health`
- [ ] Student Portal compilado: Veja no terminal "Local: http://localhost:4200"
- [ ] Admin Portal compilado: Veja no terminal "Local: http://localhost:4201"
- [ ] Cache do navegador limpo: Ctrl+Shift+R
- [ ] DevTools aberto (F12) para ver erros
- [ ] Portas livres: `lsof -i :3000 :4200 :4201`

---

## 🎨 **Funcionalidades para Testar:**

### Student Portal
1. Abra http://localhost:4200
2. Teste dark mode (ícone ☀️)
3. Navegue: Home → Dashboard → Login
4. Veja as cores mudarem no dark mode

### Admin Portal  
1. Abra http://localhost:4201
2. Teste dark mode (botão "Toggle Dark Mode")
3. Veja o tema mudar
4. Explore a interface

### Backend
1. Abra http://localhost:3000/api/docs
2. Expanda "students"
3. Teste POST /api/auth/register:
```json
{
  "email": "teste@example.com",
  "password": "Teste123!",
  "role": "ADMIN"
}
```
4. Teste POST /api/auth/login
5. Copie o accessToken
6. Clique em "Authorize" (topo)
7. Cole: `Bearer <token>`
8. Agora teste GET /api/students

---

## 📱 **Em Caso de Dúvida:**

1. **Verifique os logs do terminal** onde rodou `pnpm dev:student` ou `pnpm dev:admin`
2. **Veja o console do navegador** (F12 → Console tab)
3. **Teste em modo anônimo** do navegador
4. **Reinicie do zero** seguindo o "Reset Total" acima

---

**🎉 Sistema funcionando! Qualquer problema, siga este guia!**

