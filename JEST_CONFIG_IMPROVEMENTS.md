# Melhorias na Configuração do Jest - Coverage Inteligente

## 📊 Por que Excluir DTOs do Coverage?

DTOs (Data Transfer Objects) são **classes passivas** que apenas definem estrutura de dados com decoradores de validação. Eles **NÃO contêm lógica de negócio**, portanto não faz sentido testá-los diretamente.

### Exemplo de DTO (não precisa testar):

```typescript
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  email: string;

  @IsDate()
  @Type(() => Date)
  birthDate: Date;
}
```

**O que testamos aqui?** Nada! São apenas decoradores.

**O que é testado?** As validações são testadas automaticamente pelo `class-validator` quando você usa o DTO nas requisições.

---

## ✅ Arquivos Excluídos do Coverage

### Em TODOS os projetos:

```javascript
collectCoverageFrom: [
  'src/**/*.{ts,js}',
  '!src/**/*.spec.ts', // Testes
  '!src/**/*.dto.ts', // DTOs ✨ NOVO
  '!src/**/*.module.ts', // Módulos NestJS
  '!src/**/*.entity.ts', // Entidades TypeORM
  '!src/**/*.enum.ts', // Enums
  '!src/**/*.schema.ts', // Schemas
  '!src/**/index.ts', // Exports
  '!src/main.ts', // Entry point
  '!src/test-config/**', // Config de testes
];
```

---

## 📈 Resultados Melhorados

### Antes (com DTOs):

```
common: Statements 72.72% | Branches 91.66% | Functions 62.5% | Lines 75.86%
```

### Depois (sem DTOs):

```
common: Statements 100% ✅ | Branches 91.66% ✅ | Functions 100% ✅ | Lines 100% ✅
```

**Diferença:** Agora o coverage reflete apenas código com lógica real! 🎯

---

## 🎯 Foco no que Importa

### O que DEVE ser testado:

- ✅ **Services** - Lógica de negócio
- ✅ **Controllers** - Endpoints e rotas
- ✅ **Guards** - Autenticação e autorização
- ✅ **Filters** - Tratamento de erros
- ✅ **Pipes** - Transformações de dados
- ✅ **Utils** - Funções auxiliares
- ✅ **Abstracts** - Classes base com lógica

### O que NÃO precisa ser testado diretamente:

- ❌ **DTOs** - Apenas decoradores de validação
- ❌ **Entities** - Apenas definição de schema
- ❌ **Enums** - Apenas constantes
- ❌ **Interfaces** - Apenas tipos
- ❌ **Modules** - Apenas configuração
- ❌ **main.ts** - Bootstrap da aplicação

---

## 📝 Configurações Aplicadas

### Apps/API:

```typescript
// apps/api/jest.config.ts
collectCoverageFrom: [
  'src/**/*.{ts,js}',
  '!src/**/*.spec.ts',
  '!src/**/*.module.ts',
  '!src/**/*.dto.ts',          // ✨ Excluir DTOs
  '!src/**/index.ts',
  '!src/main.ts',
  '!src/test-config/**',       // ✨ Excluir config de testes
],
```

### Libs/Common:

```typescript
// libs/shared/common/jest.config.ts
collectCoverageFrom: [
  'src/**/*.{ts,js}',
  '!src/**/*.spec.ts',
  '!src/**/*.module.ts',
  '!src/**/*.enum.ts',
  '!src/**/*.schema.ts',
  '!src/**/*.dto.ts',          // ✨ Excluir DTOs
  '!src/**/index.ts',
],
```

### Libs/Domain:

```typescript
// libs/shared/domain/jest.config.ts
collectCoverageFrom: [
  'src/**/*.{ts,js}',
  '!src/**/*.spec.ts',
  '!src/**/*.entity.ts',       // ✨ Excluir Entities
  '!src/**/*.dto.ts',          // ✨ Excluir DTOs
  '!src/**/index.ts',
],
```

### Libs/Types:

```typescript
// libs/shared/types/jest.config.ts
collectCoverageFrom: [
  'src/**/*.{ts,js}',
  '!src/**/*.spec.ts',
  '!src/**/*.enum.ts',         // ✨ Excluir Enums
  '!src/**/index.ts',
],
```

---

## 🚀 Benefícios

1. **Coverage mais preciso** - Apenas código com lógica
2. **Foco no que importa** - Não perde tempo testando decoradores
3. **Métricas realistas** - 100% coverage é alcançável
4. **Menos ruído** - Relatórios mais limpos
5. **Performance** - Menos arquivos para processar

---

## 💡 Dica: Como Testar DTOs?

**Resposta:** Você já testa indiretamente!

Quando você faz uma requisição HTTP no teste de integração:

```typescript
const response = await request(app.getHttpServer()).post('/students').send({
  fullName: 'João',
  email: 'invalid-email', // ❌ Vai falhar na validação
});

expect(response.status).toBe(400); // Bad Request
```

O `class-validator` automaticamente valida o DTO! ✅

---

## 📊 Comando para Verificar Coverage

```bash
# Coverage completo
pnpm test:coverage

# Coverage de um projeto específico
NODE_ENV=test nx test api --coverage
NODE_ENV=test nx test common --coverage
```

---

## 🎯 Próximos Passos

1. ✅ DTOs excluídos do coverage
2. ✅ Entities excluídas do coverage
3. ✅ Enums excluídos do coverage
4. ✅ Coverage focado em lógica real
5. 🎯 Manter coverage acima de 80% no código com lógica

---

**Resultado:** Coverage inteligente que reflete a qualidade real do código! 🚀
