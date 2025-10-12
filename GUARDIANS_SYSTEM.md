# 👨‍👩‍👧‍👦 Sistema de Responsáveis (Guardians)

## 📐 **Estrutura no Backend (JÁ IMPLEMENTADO)**

### 1. **Entidades**

```
Guardian (Responsável)
├── id (UUID)
├── fullName
├── email (unique)
├── cpf (unique)
├── rg
├── birthDate
├── phone
├── alternativePhone
├── address, city, state, zipCode
├── profession
└── notes

Student (Aluno)
├── id (UUID)
├── fullName
├── email
├── ... (outros dados)
└── studentGuardians[] (relacionamento)

StudentGuardian (Relacionamento - Tabela Pivot)
├── id (UUID)
├── studentId (FK → Student)
├── guardianId (FK → Guardian)
├── relationship (enum: FATHER, MOTHER, GRANDFATHER, etc)
├── isFinanciallyResponsible (boolean) ⭐
├── isEmergencyContact (boolean)
├── canPickUp (boolean)
└── notes
```

### 2. **Relacionamento**

```
Guardian ←────┐
              │ Many-to-Many
              ├─── StudentGuardian (pivot table)
              │
Student ──────┘
```

**Um responsável** pode ter **vários filhos** (students)  
**Um aluno** pode ter **vários responsáveis** (guardians)

---

## 🔌 **API Endpoints (JÁ FUNCIONANDO)**

### Criar Responsável
```http
POST /api/guardians
Content-Type: application/json

{
  "fullName": "João Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "phone": "(34) 99999-9999",
  "address": "Rua X, 123",
  "city": "Araxá",
  "state": "MG",
  "zipCode": "38180-000"
}

Response: 201 Created
{
  "id": "uuid-do-responsavel",
  "fullName": "João Silva",
  ...
}
```

### Vincular Responsável ao Aluno
```http
POST /api/guardians/link-to-student
Content-Type: application/json

{
  "studentId": "uuid-do-aluno",
  "guardianId": "uuid-do-responsavel",
  "relationship": "FATHER",
  "isFinanciallyResponsible": true,
  "isEmergencyContact": true,
  "canPickUp": true,
  "notes": "Pai do aluno, responsável por pagamentos"
}

Response: 201 Created
{
  "id": "uuid-do-relacionamento",
  ...
}
```

### Listar Responsáveis de um Aluno
```http
GET /api/guardians/student/:studentId

Response: 200 OK
[
  {
    "id": "uuid-relacionamento-1",
    "relationship": "FATHER",
    "isFinanciallyResponsible": true,
    "isEmergencyContact": true,
    "canPickUp": true,
    "guardian": {
      "id": "uuid-responsavel-1",
      "fullName": "João Silva",
      "email": "joao@email.com",
      "phone": "(34) 99999-9999"
    }
  },
  {
    "id": "uuid-relacionamento-2",
    "relationship": "MOTHER",
    "isFinanciallyResponsible": false,
    "guardian": {
      "id": "uuid-responsavel-2",
      "fullName": "Maria Silva",
      ...
    }
  }
]
```

### Buscar Responsável Financeiro
```http
GET /api/guardians/student/:studentId/financially-responsible

Response: 200 OK
[
  {
    "id": "uuid-responsavel",
    "fullName": "João Silva",
    "email": "joao@email.com",
    "phone": "(34) 99999-9999"
  }
]
```

### Atualizar Responsável
```http
PATCH /api/guardians/:id
Content-Type: application/json

{
  "phone": "(34) 98888-8888",
  "address": "Rua Nova, 456"
}
```

### Deletar Relacionamento
```http
DELETE /api/guardians/relationship/:relationshipId
```

### Deletar Responsável
```http
DELETE /api/guardians/:id
```

---

## 🎯 **Tipos de Relacionamento (Enum)**

```typescript
enum GuardianRelationship {
  FATHER = 'FATHER',           // Pai
  MOTHER = 'MOTHER',           // Mãe
  GRANDFATHER = 'GRANDFATHER', // Avô
  GRANDMOTHER = 'GRANDMOTHER', // Avó
  UNCLE = 'UNCLE',             // Tio
  AUNT = 'AUNT',               // Tia
  BROTHER = 'BROTHER',         // Irmão
  SISTER = 'SISTER',           // Irmã
  LEGAL_GUARDIAN = 'LEGAL_GUARDIAN', // Tutor Legal
  OTHER = 'OTHER',             // Outro
}
```

---

## 💡 **Casos de Uso**

### Caso 1: Cadastrar Aluno Criança com Pai e Mãe
```
1. POST /api/students (criar Lucas, 8 anos)
2. POST /api/guardians (criar João Silva - pai)
3. POST /api/guardians/link-to-student
   {
     studentId: lucas-id,
     guardianId: joao-id,
     relationship: "FATHER",
     isFinanciallyResponsible: true  ✅ Responsável por pagar
   }
4. POST /api/guardians (criar Maria Silva - mãe)
5. POST /api/guardians/link-to-student
   {
     studentId: lucas-id,
     guardianId: maria-id,
     relationship: "MOTHER",
     isFinanciallyResponsible: false
   }
```

**Resultado**: Lucas tem 2 responsáveis, João é o responsável financeiro.

### Caso 2: Dois Irmãos com Mesmo Responsável
```
1. POST /api/students (criar Lucas)
2. POST /api/students (criar Maria)
3. POST /api/guardians (criar João Silva)
4. POST /api/guardians/link-to-student (João → Lucas, FATHER, financeiro=true)
5. POST /api/guardians/link-to-student (João → Maria, FATHER, financeiro=true)
```

**Resultado**: João é responsável de Lucas e Maria.

### Caso 3: Avó Responsável
```
1. POST /api/students (criar Pedro)
2. POST /api/guardians (criar Ana Costa - avó)
3. POST /api/guardians/link-to-student
   {
     studentId: pedro-id,
     guardianId: ana-id,
     relationship: "GRANDMOTHER",
     isFinanciallyResponsible: true,
     canPickUp: true
   }
```

**Resultado**: Avó é responsável legal e financeira.

---

## 🔐 **Permissões e Acesso (RBAC)**

### Guardian pode:
- ✅ Ver dados dos filhos (students vinculados)
- ✅ Ver faixas e graduações dos filhos
- ✅ Ver pagamentos (se `isFinanciallyResponsible = true`)
- ✅ Atualizar seus próprios dados
- ❌ Ver dados de outros alunos
- ❌ Ver dados de outros responsáveis

### Exemplo no JWT:
```json
{
  "sub": "guardian-uuid",
  "email": "joao@email.com",
  "role": "GUARDIAN",
  "studentIds": ["lucas-id", "maria-id"]  // Filhos que pode acessar
}
```

---

## 📱 **Como Implementar no Frontend**

### 1. **Formulário de Aluno - Adicionar Seção de Responsáveis**

```tsx
// StudentForm.tsx
<Box>
  <Typography variant="h6">Responsáveis</Typography>
  
  {/* Se aluno é criança (age < 18), campo obrigatório */}
  {ageCategory === 'CHILD' && (
    <Alert severity="info">
      Alunos menores de idade precisam de pelo menos 1 responsável
    </Alert>
  )}
  
  <Button onClick={handleAddGuardian}>
    + Adicionar Responsável
  </Button>
  
  {guardians.map((guardian, index) => (
    <Card key={index}>
      <TextField label="Nome Completo" />
      <TextField label="CPF" />
      <TextField label="Email" />
      <TextField label="Telefone" />
      
      <FormControl>
        <InputLabel>Parentesco</InputLabel>
        <Select>
          <MenuItem value="FATHER">Pai</MenuItem>
          <MenuItem value="MOTHER">Mãe</MenuItem>
          <MenuItem value="GRANDFATHER">Avô</MenuItem>
          <MenuItem value="GRANDMOTHER">Avó</MenuItem>
          ...
        </Select>
      </FormControl>
      
      <FormControlLabel
        control={<Checkbox />}
        label="Responsável Financeiro"
      />
      <FormControlLabel
        control={<Checkbox />}
        label="Contato de Emergência"
      />
      <FormControlLabel
        control={<Checkbox />}
        label="Pode Buscar o Aluno"
      />
    </Card>
  ))}
</Box>
```

### 2. **Fluxo de Criação**

```typescript
async function handleSubmit() {
  // 1. Criar aluno
  const student = await api.post('/api/students', studentData);
  
  // 2. Para cada responsável:
  for (const guardianData of guardians) {
    // 2a. Criar responsável (ou buscar se já existe por CPF)
    const guardian = await api.post('/api/guardians', guardianData);
    
    // 2b. Vincular ao aluno
    await api.post('/api/guardians/link-to-student', {
      studentId: student.id,
      guardianId: guardian.id,
      relationship: guardianData.relationship,
      isFinanciallyResponsible: guardianData.isFinanciallyResponsible,
      isEmergencyContact: guardianData.isEmergencyContact,
      canPickUp: guardianData.canPickUp,
    });
  }
}
```

### 3. **Buscar Responsável Existente por CPF**

```typescript
async function searchGuardianByCpf(cpf: string) {
  const guardians = await api.get(`/api/guardians?cpf=${cpf}`);
  if (guardians.length > 0) {
    // Responsável já existe, perguntar se quer reutilizar
    return guardians[0];
  }
  return null;
}
```

---

## 🎨 **UI/UX Recomendado**

### Tela de Cadastro de Aluno:

```
┌─────────────────────────────────────┐
│ Dados do Aluno                      │
│ [Nome] [CPF] [Email]                │
│ [Data Nasc] [Telefone]              │
│                                     │
│ 👨‍👩‍👧‍👦 Responsáveis                  │
│ ┌─────────────────────────────────┐ │
│ │ Responsável 1                   │ │
│ │ [João Silva]                    │ │
│ │ CPF: 123.456.789-00             │ │
│ │ 📞 (34) 99999-9999              │ │
│ │ Parentesco: Pai                 │ │
│ │ ☑ Responsável Financeiro        │ │
│ │ ☑ Contato de Emergência         │ │
│ │ [Editar] [Remover]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Responsável 2                   │ │
│ │ [Maria Silva]                   │ │
│ │ CPF: 987.654.321-00             │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Adicionar Responsável]           │
│                                     │
│ [Salvar] [Cancelar]                 │
└─────────────────────────────────────┘
```

---

## ✅ **Validações**

1. **Aluno CHILD (< 18 anos)**: Requer pelo menos 1 responsável
2. **Aluno ADULT**: Responsável é opcional
3. **CPF único**: Não pode duplicar responsável com mesmo CPF
4. **Email único**: Não pode duplicar email
5. **Pelo menos 1 responsável financeiro**: Se houver responsáveis, pelo menos 1 deve ser financeiro

---

## 📊 **Exemplo Real: Família Silva**

```
João Silva (Pai)
└── Responsável Financeiro de:
    ├── Lucas Silva (8 anos, Faixa Amarela)
    └── Maria Silva (10 anos, Faixa Laranja)

Ana Silva (Mãe)
└── Contato de Emergência de:
    ├── Lucas Silva
    └── Maria Silva

Avó Carmen
└── Pode buscar:
    └── Lucas Silva
```

**No sistema**:
- João vê no portal: Lucas + Maria
- João recebe cobranças: Lucas + Maria
- Ana vê no portal: Lucas + Maria
- Ana NÃO recebe cobranças
- Avó pode buscar apenas Lucas

---

**Sistema de Responsáveis 100% implementado e pronto para uso!** 🎉

