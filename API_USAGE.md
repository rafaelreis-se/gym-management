# 📘 API Usage Guide

## 🚀 Quick Start

### 1. Start Database
```bash
docker compose up -d
```

### 2. Start API
```bash
pnpm dev
```

### 3. Access
- **API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/api/docs
- **Health**: http://localhost:3000/api/health
- **pgAdmin**: http://localhost:5050 (admin@gym-management.local / admin)

---

## 🔐 Authentication Flow

### Scenario 1: Admin Creates Student → Student First Access

#### Step 1: Admin creates student (no password)
```bash
POST /api/auth/register
{
  "email": "maria@example.com",
  "role": "STUDENT",
  "studentId": "student-uuid-here"
  // No password = first access required
}

Response:
{
  "id": "user-uuid",
  "email": "maria@example.com",
  "isFirstAccess": true,  ← User needs to set password
  ...
}
```

#### Step 2: Send email to student with link
```
Email: "Welcome! Set your password: http://app.com/first-access?userId=user-uuid"
```

#### Step 3: Student sets password
```bash
POST /api/auth/set-password
{
  "userId": "user-uuid",
  "password": "SecurePass123!"
}

Response:
{
  "message": "Password set successfully"
}
```

#### Step 4: Student logs in
```bash
POST /api/auth/login
{
  "email": "maria@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "user-uuid",
    "email": "maria@example.com",
    "role": "STUDENT",
    "studentId": "student-uuid-here",
    ...
  }
}
```

---

### Scenario 2: Guardian with 2 Children

#### Step 1: Admin creates guardian
```bash
POST /api/guardians
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678901",
  "phone": "11999999999"
}

Response: { "id": "guardian-abc-123", ... }
```

#### Step 2: Admin creates user for guardian
```bash
POST /api/auth/register
{
  "email": "joao@example.com",
  "role": "GUARDIAN",
  "guardianId": "guardian-abc-123"
}

Response: { "id": "user-joao-123", "isFirstAccess": true, ... }
```

#### Step 3: Admin creates students
```bash
POST /api/students
{ "fullName": "Maria Silva", "cpf": "11111111111", ... }
→ Response: { "id": "maria-id", ... }

POST /api/students
{ "fullName": "Pedro Silva", "cpf": "22222222222", ... }
→ Response: { "id": "pedro-id", ... }
```

#### Step 4: Link guardian to both children
```bash
POST /api/guardians/link-to-student
{
  "guardianId": "guardian-abc-123",
  "studentId": "maria-id",
  "relationship": "FATHER",
  "isFinanciallyResponsible": true,
  "isEmergencyContact": true,
  "canPickUp": true
}

POST /api/guardians/link-to-student
{
  "guardianId": "guardian-abc-123",
  "studentId": "pedro-id",
  "relationship": "FATHER",
  "isFinanciallyResponsible": true,
  "isEmergencyContact": true,
  "canPickUp": true
}
```

#### Step 5: Guardian sets password and logs in
```bash
POST /api/auth/set-password
{ "userId": "user-joao-123", "password": "SecurePass123!" }

POST /api/auth/login
{ "email": "joao@example.com", "password": "SecurePass123!" }

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "xyz...",
  "user": { "role": "GUARDIAN", "guardianId": "guardian-abc-123", ... }
}
```

#### Step 6: Guardian accesses children's data
```bash
# Get all children
GET /api/students/my-children
Authorization: Bearer eyJhbGc...

Response:
[
  { "id": "maria-id", "fullName": "Maria Silva", ... },
  { "id": "pedro-id", "fullName": "Pedro Silva", ... }
]

# Get specific child's enrollments
GET /api/enrollments/student/maria-id
Authorization: Bearer eyJhbGc...

Response:
[
  { "id": "enroll-1", "modality": "JIU_JITSU", "plan": {...}, ... }
]

# Get all children's enrollments
GET /api/enrollments/my-children-enrollments
Authorization: Bearer eyJhbGc...

Response:
[
  // Maria's enrollments
  { "studentId": "maria-id", "modality": "JIU_JITSU", ... },
  // Pedro's enrollments
  { "studentId": "pedro-id", "modality": "JIU_JITSU", ... }
]

# Try to access OTHER student (not their child)
GET /api/students/other-student-id
Authorization: Bearer eyJhbGc...

Response: 403 Forbidden - "You can only access your children's data"
```

---

### Scenario 3: OAuth2 Social Login

#### Google Login
```bash
# 1. Redirect user to Google
GET /api/auth/google

# 2. User authenticates on Google
# 3. Google redirects back to callback
GET /api/auth/google/callback?code=...

# 4. API automatically creates/finds user and returns tokens
Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "abc...",
  "user": {
    "email": "user@gmail.com",
    "authProvider": "GOOGLE",
    "role": "STUDENT",
    ...
  }
}
```

---

## 🛡️ Authorization Examples

### Admin - Full Access
```bash
# Admin can do EVERYTHING
POST /api/students              ✅ Create
GET  /api/students              ✅ List all
GET  /api/students/:id          ✅ View any
PATCH /api/students/:id         ✅ Update any
DELETE /api/students/:id        ✅ Delete any

POST /api/financial/payments    ✅ Create payment
GET  /api/financial/payments    ✅ View all
PATCH /api/financial/payments/:id/mark-as-paid  ✅ Mark as paid
```

### Instructor - Read Access to Students
```bash
GET  /api/students              ✅ List all (read-only)
GET  /api/students/:id          ✅ View any student
POST /api/graduations           ✅ Grant graduations
POST /api/students              ❌ Cannot create
PATCH /api/students/:id         ❌ Cannot update
GET  /api/financial/payments    ❌ No financial access
```

### Student - Own Data Only
```bash
GET  /api/students/me           ✅ Own profile
GET  /api/enrollments/my-enrollments  ✅ Own enrollments
GET  /api/graduations/student/:self   ✅ Own graduations
GET  /api/students/:other-id    ❌ Cannot see other students
GET  /api/students              ❌ Cannot list all
POST /api/students              ❌ Cannot create
```

### Guardian - Children's Data Only
```bash
GET  /api/students/my-children              ✅ All children
GET  /api/students/:child-id                ✅ Specific child
GET  /api/enrollments/student/:child-id     ✅ Child's enrollments
GET  /api/enrollments/my-children-enrollments  ✅ All children's enrollments
GET  /api/graduations/student/:child-id     ✅ Child's graduations
GET  /api/financial/payments (filtered)     ✅ Children's payments
GET  /api/students/:other-student-id        ❌ Not their child
POST /api/students                          ❌ Cannot create
```

---

## 📝 Complete Example: Enrolling Two Siblings

### Setup (Admin)
```bash
# 1. Create Guardian
POST /api/guardians
Authorization: Bearer <admin-token>
{
  "fullName": "Ana Santos",
  "email": "ana@example.com",
  "cpf": "11111111111",
  "phone": "11988888888"
}
→ guardianId: "guardian-123"

# 2. Create Guardian User
POST /api/auth/register
Authorization: Bearer <admin-token>
{
  "email": "ana@example.com",
  "role": "GUARDIAN",
  "guardianId": "guardian-123"
}
→ userId: "user-ana-123" (isFirstAccess: true)

# 3. Create Child 1
POST /api/students
Authorization: Bearer <admin-token>
{
  "fullName": "Lucas Santos",
  "cpf": "33333333333",
  "birthDate": "2015-05-10",
  "ageCategory": "CHILD",
  ...
}
→ studentId: "lucas-id"

# 4. Create Child 2
POST /api/students
Authorization: Bearer <admin-token>
{
  "fullName": "Sofia Santos",
  "cpf": "44444444444",
  "birthDate": "2012-08-20",
  "ageCategory": "CHILD",
  ...
}
→ studentId: "sofia-id"

# 5. Link Guardian to Lucas
POST /api/guardians/link-to-student
Authorization: Bearer <admin-token>
{
  "guardianId": "guardian-123",
  "studentId": "lucas-id",
  "relationship": "MOTHER",
  "isFinanciallyResponsible": true,
  "isEmergencyContact": true
}

# 6. Link Guardian to Sofia
POST /api/guardians/link-to-student
Authorization: Bearer <admin-token>
{
  "guardianId": "guardian-123",
  "studentId": "sofia-id",
  "relationship": "MOTHER",
  "isFinanciallyResponsible": true,
  "isEmergencyContact": true
}

# 7. Create Enrollment for Lucas
POST /api/enrollments
Authorization: Bearer <admin-token>
{
  "studentId": "lucas-id",
  "planId": "plan-monthly-id",
  "modality": "JIU_JITSU",
  "startDate": "2025-10-01"
}

# 8. Create Enrollment for Sofia
POST /api/enrollments
Authorization: Bearer <admin-token>
{
  "studentId": "sofia-id",
  "planId": "plan-monthly-id",
  "modality": "JIU_JITSU",
  "startDate": "2025-10-01"
}
```

### Guardian Usage
```bash
# 1. Guardian sets password (first access)
POST /api/auth/set-password
{
  "userId": "user-ana-123",
  "password": "SecurePass123!"
}

# 2. Guardian logs in
POST /api/auth/login
{
  "email": "ana@example.com",
  "password": "SecurePass123!"
}
→ accessToken, refreshToken

# 3. See both children
GET /api/students/my-children
Authorization: Bearer <token>

Response:
[
  { "id": "lucas-id", "fullName": "Lucas Santos", "ageCategory": "CHILD", ... },
  { "id": "sofia-id", "fullName": "Sofia Santos", "ageCategory": "CHILD", ... }
]

# 4. See Lucas's details
GET /api/students/lucas-id
Authorization: Bearer <token>

# 5. See Sofia's enrollments
GET /api/enrollments/student/sofia-id
Authorization: Bearer <token>

# 6. See ALL children's enrollments at once
GET /api/enrollments/my-children-enrollments
Authorization: Bearer <token>

Response:
[
  { "studentId": "lucas-id", "modality": "JIU_JITSU", ... },
  { "studentId": "sofia-id", "modality": "JIU_JITSU", ... }
]

# 7. See who is financially responsible
GET /api/guardians/student/lucas-id/financially-responsible
Authorization: Bearer <admin-token>

Response:
[
  { "id": "guardian-123", "fullName": "Ana Santos", "email": "ana@example.com", ... }
]
```

---

## 🏃 Common Workflows

### New Student Registration (by Admin)
```bash
1. POST /api/students → Create student
2. POST /api/guardians → Create guardian (if child)
3. POST /api/guardians/link-to-student → Link guardian to student
4. POST /api/auth/register → Create user account for student/guardian
5. POST /api/enrollments → Create enrollment
6. Send welcome email with first access link
```

### Payment Flow
```bash
1. GET /api/financial/plans/active → List available plans
2. POST /api/enrollments → Enroll student
3. System auto-generates payment schedule
4. GET /api/financial/payments/pending → Check pending payments
5. PATCH /api/financial/payments/:id/mark-as-paid → Mark as paid
6. GET /api/financial/payments/overdue → Monitor overdue
```

### Graduation Flow
```bash
1. Instructor decides to promote student
2. POST /api/graduations → Record graduation
   {
     "studentId": "...",
     "modality": "JIU_JITSU",
     "beltColor": "BLUE",
     "beltDegree": "DEGREE_1",
     "graduationDate": "2025-10-15",
     "grantedBy": "Professor João"
   }
3. Student/Guardian can see via GET /api/graduations/student/:id
```

### Product Sale
```bash
1. GET /api/products/active → List available products
2. POST /api/products/sales → Create sale
   {
     "studentId": "student-id",
     "items": [
       { "productId": "kimono-id", "quantity": 1 },
       { "productId": "belt-id", "quantity": 1 }
     ],
     "paymentMethod": "CREDIT_CARD",
     "discountAmount": 10.00
   }
3. System auto-updates stock
4. GET /api/products/low-stock → Check if reorder needed
```

---

## 🔒 Security Examples

### Token Usage
```bash
# Store tokens securely (localStorage/sessionStorage in frontend)
const accessToken = "eyJhbGc...";
const refreshToken = "abc123...";

# Use in requests
fetch('http://localhost:3000/api/students', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

# When access token expires (401)
POST /api/auth/refresh
{ "refreshToken": "abc123..." }

→ Get new accessToken

# On logout
POST /api/auth/logout
{ "refreshToken": "abc123..." }
```

### Multiple Guardians Example
```bash
# Student has divorced parents, both responsible

Student: João Pedro (id: "joao-id")

Guardian 1 (Mother):
POST /api/guardians/link-to-student
{
  "guardianId": "mother-id",
  "studentId": "joao-id",
  "relationship": "MOTHER",
  "isFinanciallyResponsible": true,  ← Gets invoices
  "isEmergencyContact": true
}

Guardian 2 (Father):
POST /api/guardians/link-to-student
{
  "guardianId": "father-id",
  "studentId": "joao-id",
  "relationship": "FATHER",
  "isFinanciallyResponsible": true,  ← Also gets invoices
  "isEmergencyContact": true
}

Guardian 3 (Grandmother):
POST /api/guardians/link-to-student
{
  "guardianId": "grandma-id",
  "studentId": "joao-id",
  "relationship": "GRANDMOTHER",
  "isFinanciallyResponsible": false,  ← No invoices
  "isEmergencyContact": true,
  "canPickUp": true  ← Can pick up from class
}

# Query financially responsible
GET /api/guardians/student/joao-id/financially-responsible

Response:
[
  { "id": "mother-id", "fullName": "...", "email": "mother@..." },
  { "id": "father-id", "fullName": "...", "email": "father@..." }
]
// Grandmother NOT included
```

---

## 🎯 Role-Based Scenarios

### Admin Dashboard
```bash
# Admin sees everything
GET /api/students                        ← All students
GET /api/financial/payments/overdue      ← All overdue payments
GET /api/financial/payments/pending      ← All pending
GET /api/products/low-stock              ← Inventory alerts
POST /api/students                       ← Create student
POST /api/financial/plans                ← Create plan
POST /api/products                       ← Add product
```

### Instructor Portal
```bash
# Instructor can view and promote
GET  /api/students                       ← View all (read-only)
GET  /api/students/:id                   ← View details
POST /api/graduations                    ← Grant belt promotions
GET  /api/graduations                    ← See graduation history
POST /api/students                       ← ❌ Cannot create
GET  /api/financial/payments             ← ❌ No financial access
```

### Student App
```bash
# Student sees only their own data
GET /api/students/me                     ← Own profile
GET /api/enrollments/my-enrollments      ← Own enrollments
GET /api/graduations/student/:self       ← Own graduations
GET /api/products/active                 ← Can see products (to buy)
GET /api/students                        ← ❌ Cannot list all
GET /api/students/:other-id              ← ❌ Cannot see others
```

### Guardian App
```bash
# Guardian sees children's data
GET /api/students/my-children            ← All children
GET /api/students/:child-id              ← Child profile
GET /api/enrollments/my-children-enrollments  ← All enrollments
GET /api/enrollments/student/:child-id   ← Specific child's enrollments
GET /api/graduations/student/:child-id   ← Child's graduations
GET /api/students/:non-child-id          ← ❌ Access denied
```

---

## 🧪 Testing with cURL

```bash
# Health Check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use token
TOKEN="eyJhbGc..."
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer $TOKEN"

# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "test@example.com",
    "cpf": "12345678901",
    "birthDate": "2010-01-01",
    "phone": "11999999999",
    "address": "Rua Teste, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234567",
    "ageCategory": "CHILD"
  }'
```

---

## 📊 Database Relationships

### Guardian ↔ Students (Many-to-Many)

```
guardians table
  ├─ id (PK)
  └─ fullName, email, cpf, ...

students table
  ├─ id (PK)
  └─ fullName, email, cpf, ...

student_guardians table (junction)
  ├─ id (PK)
  ├─ guardianId (FK → guardians)
  ├─ studentId (FK → students)
  ├─ relationship (FATHER, MOTHER, etc.)
  ├─ isFinanciallyResponsible (boolean)
  ├─ isEmergencyContact (boolean)
  └─ canPickUp (boolean)

users table
  ├─ id (PK)
  ├─ email (unique)
  ├─ passwordHash
  ├─ role (ADMIN, STUDENT, GUARDIAN, INSTRUCTOR)
  ├─ studentId (FK → students) [nullable]
  └─ guardianId (FK → guardians) [nullable]
```

**One Guardian → Multiple Students** ✅
**One Student → Multiple Guardians** ✅
**Flexible permissions per relationship** ✅

---

## 🔐 Security Summary

| Feature | Implementation | Same as Big Companies? |
|---------|---------------|------------------------|
| **Password Hashing** | bcrypt (10 rounds) | ✅ GitHub, AWS, Google |
| **JWT Tokens** | Access + Refresh | ✅ Auth0, AWS Cognito |
| **OAuth2** | Google, Facebook | ✅ Most SaaS apps |
| **RBAC** | Role-based guards | ✅ Enterprise standard |
| **Token Rotation** | Refresh token system | ✅ Netflix, Spotify |
| **Multi-Provider** | Local + Social | ✅ LinkedIn, Twitter |
| **Resource Ownership** | Guardian → Children | ✅ Family sharing (Apple, Google) |

---

**API is ready for production use! 🚀**

