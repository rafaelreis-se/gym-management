# 🔧 Troubleshooting Guide

## ❓ Página em Branco nos Portais

### Solução 1: Limpar Cache do Navegador
```bash
# Chrome/Edge
Ctrl + Shift + Delete → Limpar cache

# Ou forçar reload
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Ou modo anônimo
Ctrl + Shift + N
```

### Solução 2: Verificar Console do Navegador
```bash
# Abra DevTools
F12 ou Ctrl+Shift+I

# Aba Console
Procure por erros em vermelho

# Erros comuns:
- Module not found → Rebuild: pnpm build:student
- CORS error → API não está rodando
- 404 error → Porta errada
```

### Solução 3: Recompilar
```bash
# Parar todos os processos
pkill -f "nx serve"

# Limpar cache
pnpm reset:cache

# Rebuild tudo
pnpm build:all

# Subir novamente
pnpm dev:student  # Terminal 1
pnpm dev:admin    # Terminal 2
```

### Solução 4: Verificar se está rodando
```bash
# Testar Student Portal
curl http://localhost:4200

# Testar Admin Portal  
curl http://localhost:4201

# Deve retornar HTML, não erro
```

---

## ❓ API Retorna 401 Unauthorized

### Causa
Endpoint está protegido por JWT

### Solução
```bash
# 1. Fazer login primeiro
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "senha"
}

# 2. Pegar o accessToken da resposta

# 3. Usar no header
Authorization: Bearer <accessToken>
```

---

## ❓ Testes Falhando

### Solução
```bash
# Criar .env.test se não existe
cat > .env.test << 'EOF'
NODE_ENV=test
DB_USERNAME=test
DB_PASSWORD=test
DB_NAME=test_db
JWT_SECRET=test-secret
JWT_REFRESH_SECRET=test-refresh-secret
EOF

# Rodar testes
NODE_ENV=test pnpm test
```

---

## ❓ Build Falhando

### Solução
```bash
# 1. Limpar tudo
pnpm clean:all

# 2. Reinstalar dependências
pnpm install

# 3. Rebuild
pnpm build:all
```

---

## ❓ Docker Não Sobe

### Solução
```bash
# Verificar se porta 5432 está ocupada
sudo lsof -i :5432

# Parar containers anteriores
docker compose down

# Limpar volumes
docker compose down -v

# Subir novamente
docker compose up -d

# Verificar logs
docker compose logs postgres
```

---

## ❓ Dark Mode Não Funciona

### Causa
localStorage bloqueado ou não implementado

### Solução
```bash
# 1. Verificar no console do navegador
localStorage.getItem('theme-mode')

# 2. Setar manualmente
localStorage.setItem('theme-mode', 'dark')

# 3. Recarregar página
```

---

## ❓ Belt Display Não Aparece

### Possíveis Causas
1. Enum não está sendo importado corretamente
2. Build da lib ui-components falhou
3. Cache do Vite

### Solução
```bash
# Rebuild ui-components
pnpm nx build ui-components --skip-nx-cache

# Rebuild portais
pnpm nx build student-portal --skip-nx-cache
pnpm nx build admin-portal --skip-nx-cache

# Parar e reiniciar dev servers
pkill -f "nx serve"
pnpm dev:student
pnpm dev:admin
```

---

## 🚀 Comandos de Reset Completo

```bash
# RESET TOTAL (quando nada funciona)

# 1. Parar TUDO
pkill -f "nx serve"
docker compose down

# 2. Limpar TUDO
pnpm clean:all
rm -rf .nx dist coverage

# 3. Reinstalar
pnpm install

# 4. Rebuild TUDO
pnpm build:all

# 5. Subir novamente
docker compose up -d          # Terminal 1
pnpm dev                      # Terminal 2
pnpm dev:student              # Terminal 3
pnpm dev:admin                # Terminal 4

# 6. Aguardar ~30 segundos para compilar

# 7. Testar
open http://localhost:3000/api
open http://localhost:4200
open http://localhost:4201
```

---

## ✅ Checklist de Verificação

- [ ] PostgreSQL rodando (docker compose ps)
- [ ] API respondendo (curl http://localhost:3000/api/health)
- [ ] Student Portal compilado (vite messages)
- [ ] Admin Portal compilado (vite messages)
- [ ] Porta 4200 livre
- [ ] Porta 4201 livre
- [ ] Porta 3000 livre
- [ ] Porta 5432 livre
- [ ] Node.js >= 20
- [ ] pnpm >= 10
- [ ] Cache do navegador limpo
- [ ] Console do navegador sem erros

---

## 📞 Verificações Rápidas

```bash
# Status de tudo
echo "🔍 Verificando serviços..."
curl -s http://localhost:3000/api/health && echo "✅ API OK"
curl -s http://localhost:4200 | grep -q "StudentPortal" && echo "✅ Student Portal OK"
curl -s http://localhost:4201 | grep -q "AdminPortal" && echo "✅ Admin Portal OK"
docker compose ps | grep -q "healthy" && echo "✅ Database OK"

# Portas ocupadas
lsof -i :3000
lsof -i :4200
lsof -i :4201
lsof -i :5432
```

---

Siga este guia passo a passo se tiver problemas!

