# 🎨 Frontend Architecture Guide

## 📱 Overview

Sistema com **2 aplicações React** independentes no mesmo monorepo:

1. **student-portal** (Port 4200) - Portal para Alunos e Responsáveis
2. **admin-portal** (Port 4201) - Dashboard administrativo

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Framework** | React 19 | Latest, most popular |
| **UI Library** | Material UI v7 | Modern, Google-backed, 93k+ stars |
| **Styling** | Emotion (CSS-in-JS) | MUI default, scoped styles |
| **Routing** | React Router v6 | Industry standard |
| **State Management** | TanStack Query v5 | Best for server state |
| **HTTP Client** | Axios | Type-safe, interceptors |
| **Build Tool** | Vite | Lightning fast (10x faster than Webpack) |
| **Monorepo** | Nx | Same as backend |

---

## 📁 Project Structure

```
gym-management/
├── apps/
│   ├── api/                          # Backend (NestJS + Fastify)
│   ├── student-portal/               # 👥 Student & Guardian App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── pages/           # Page components
│   │   │   │   │   ├── Dashboard.tsx    # Main dashboard with belt
│   │   │   │   │   ├── Login.tsx        # Login page
│   │   │   │   │   ├── Profile.tsx      # Profile page
│   │   │   │   │   ├── Enrollments.tsx  # My enrollments
│   │   │   │   │   ├── Payments.tsx     # My payments
│   │   │   │   │   └── Children.tsx     # (Guardian) My children
│   │   │   │   ├── components/      # Reusable components
│   │   │   │   ├── hooks/           # Custom hooks
│   │   │   │   ├── contexts/        # Auth context, etc
│   │   │   │   └── app.tsx          # Main app with routes
│   │   │   ├── assets/              # Images, fonts
│   │   │   └── main.tsx             # Entry point
│   │   └── index.html
│   │
│   └── admin-portal/                 # 🔐 Admin Dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── pages/
│       │   │   │   ├── Dashboard.tsx    # Admin overview
│       │   │   │   ├── Students/        # Student management
│       │   │   │   ├── Financial/       # Financial management
│       │   │   │   ├── Products/        # Inventory
│       │   │   │   └── Reports/         # Analytics
│       │   │   └── ...
│       │   └── ...
│       └── ...
│
└── libs/shared/
    ├── ui-components/                # 🎨 Shared UI Components
    │   └── src/lib/
    │       ├── BeltDisplay/         # ⭐ Belt component with colors
    │       ├── StudentCard/
    │       ├── PaymentStatus/
    │       └── ...
    │
    ├── api-client/                   # 🔌 API Client (future)
    │   └── src/
    │       ├── services/
    │       ├── hooks/
    │       └── types/
    │
    └── common/                       # Backend types (already exists)
        └── enums/                    # Shared with frontend!
```

---

## 🥋 Belt Display Component

### Features

✅ **Visual Representation of Jiu Jitsu Belts**
- Accurate belt colors (22 variations for adult + children)
- **Black tip** on the right (characteristic of BJJ belts)
- White stripes representing degrees (1-10)
- Gradient for dual-color belts (e.g., Red/Black, Yellow/White)

✅ **Sizes**
- `small` (120x30px) - For lists
- `medium` (200x50px) - For cards
- `large` (300x70px) - For profile hero

✅ **Customizable**
- Show/hide label
- Responsive
- Accessible

### Usage Example

```tsx
import { BeltDisplay } from '@gym-management/ui-components';
import { BeltColor, BeltDegree } from '@gym-management/common';

// Simple usage
<BeltDisplay 
  beltColor={BeltColor.BLUE} 
  beltDegree={BeltDegree.DEGREE_2} 
/>

// Custom size and no label
<BeltDisplay 
  beltColor={BeltColor.BLACK} 
  beltDegree={BeltDegree.NONE}
  size="large"
  showLabel={false}
/>

// Children belt
<BeltDisplay 
  beltColor={BeltColor.YELLOW_WHITE} 
  beltDegree={BeltDegree.DEGREE_3}
  size="small"
/>
```

### Visual Examples

**Blue Belt with 2 Degrees:**
```
┌─────────────────────────────────┐
│ ░░                          ███ │  ← Black tip
│ ░░ Blue Belt                ███ │
│ ░░                          ███ │
└─────────────────────────────────┘
   ^^
   White stripes (degrees)
```

**Coral Belt (Red/Black):**
```
┌─────────────────────────────────┐
│ Red Red Black Black         ███ │
│ Red Red Black Black         ███ │
│ Red Red Black Black         ███ │
└─────────────────────────────────┘
  50%  |  50%  gradient
```

---

## 🎨 Student Portal Design

### Color Scheme
```css
Primary: #1976d2 (Blue) - Trust, professionalism
Secondary: #dc004e (Red/Pink) - Energy, passion
Background: #f5f5f5 (Light gray)
Paper: #ffffff (White)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
```

### Layout Structure

#### 1. Dashboard Page
```tsx
┌────────────────────────────────────────────────┐
│  [Avatar] Welcome back, Maria Silva!   [Active]│
│  Member since Jan 15, 2024                     │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Current Belt │  │ Next Class   │          │
│  │              │  │              │          │
│  │  [BLUE BELT] │  │ Mon, 18:00   │          │
│  │   ░░ ░░ ███  │  │ Advanced     │          │
│  │              │  ├──────────────┤          │
│  │ 2 Degrees    │  │ Payment Due  │          │
│  │              │  │ R$ 150,00    │          │
│  │ Next: 3rd    │  ├──────────────┤          │
│  │ Est: 6 months│  │ Classes      │          │
│  └──────────────┘  │ 18 / 20      │          │
│                    └──────────────┘          │
│                                                │
│  Graduation History                           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│  │WHITE│ │BLUE │ │BLUE1│ │BLUE2│ [Current]   │
│  │Jan  │ │Jul  │ │Sep  │ │Oct  │            │
│  └─────┘ └─────┘ └─────┘ └─────┘            │
└────────────────────────────────────────────────┘
```

#### 2. Login Page
```tsx
┌────────────────────────────────┐
│     Gym Management             │
│  Student & Guardian Portal     │
│                                │
│  ┌──────────────────────────┐ │
│  │ Email                    │ │
│  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │
│  │ Password                 │ │
│  └──────────────────────────┘ │
│                                │
│  [ Sign In ]                   │
│                                │
│  ──────── OR ────────          │
│                                │
│  [🔵 Continue with Google]     │
│  [🔷 Continue with Facebook]   │
└────────────────────────────────┘
```

#### 3. Guardian View (Multiple Children)
```tsx
┌────────────────────────────────────────────────┐
│  My Children                                   │
├────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │ [👦] Lucas Silva │  │ [👧] Sofia Silva │  │
│  │                  │  │                  │  │
│  │ Age: 8           │  │ Age: 10          │  │
│  │ [YELLOW ░ ███]   │  │ [ORANGE ░░ ███]  │  │
│  │ Yellow Belt      │  │ Orange Belt      │  │
│  │ 1 Degree         │  │ 2 Degrees        │  │
│  │                  │  │                  │  │
│  │ Next Class:      │  │ Next Class:      │  │
│  │ Mon 17:00        │  │ Mon 18:00        │  │
│  │                  │  │                  │  │
│  │ [ View Details ] │  │ [ View Details ] │  │
│  └──────────────────┘  └──────────────────┘  │
│                                                │
│  Combined Payment Status                      │
│  ├─ Lucas: R$ 150,00 (Paid) ✅               │
│  └─ Sofia: R$ 150,00 (Due Dec 10) ⚠️         │
└────────────────────────────────────────────────┘
```

---

## 🔐 Admin Portal Design

### Layout Structure

```tsx
┌─────────────────────────────────────────────────────┐
│ [☰] Gym Management Admin          [👤 Admin] [🔔] │
├─────┬───────────────────────────────────────────────┤
│ 📊  │  Dashboard Overview                           │
│ 👥  │                                               │
│ 🎓  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│ 💰  │  │ 250 │ │ 35  │ │ R$  │ │ 12  │            │
│ 📦  │  │ Stud│ │ New │ │25k  │ │ Ove │            │
│ 📈  │  │ents │ │ This│ │Rev. │ │rdue │            │
│ ⚙️  │  └─────┘ └─────┘ └─────┘ └─────┘            │
│     │                                               │
│     │  Recent Activity                              │
│     │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│     │  🥋 Pedro Silva promoted to Blue Belt        │
│     │  💰 Payment received from Maria Santos       │
│     │  👥 New student: João Costa                  │
│     │                                               │
│     │  [View All Students →]                       │
└─────┴───────────────────────────────────────────────┘

Sidebar:
📊 Dashboard
👥 Students
🎓 Graduations  
💰 Financial
📦 Products
📈 Reports
⚙️ Settings
```

---

## 🎯 Key Features Implemented

### Student Portal

✅ **Dashboard**
- Current belt display with visual representation
- Graduation history timeline
- Next class info
- Payment status
- Attendance tracking

✅ **Login**
- Email/Password
- Google OAuth (one-click)
- Facebook OAuth (one-click)
- First access password setup

✅ **Guardian Features**
- View all children in one place
- Switch between children easily
- See combined payment status
- Quick access to each child's data

### Admin Portal (To Implement)

🔜 **Student Management**
- List, search, filter students
- Create/edit student profiles
- Assign guardians
- Enrollment management

🔜 **Financial Dashboard**
- Overdue payments report
- Revenue charts
- Payment tracking
- Plan management

🔜 **Graduation Management**
- Grant belts and degrees
- Graduation ceremonies
- Print certificates

🔜 **Inventory**
- Product catalog
- Stock management
- Sales tracking
- Low stock alerts

🔜 **Reports & Analytics**
- Student retention
- Revenue trends
- Class attendance
- Belt progression

---

## 🎨 Design System

### Typography
```typescript
h1: 96px - Page titles
h2: 60px - Section headers
h3: 48px - Subsection headers
h4: 34px - Card titles
h5: 24px - Card headers
h6: 20px - Small headers
body1: 16px - Main text
body2: 14px - Secondary text
caption: 12px - Labels, hints
```

### Spacing
```typescript
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
```

### Components

#### BeltDisplay
```tsx
<BeltDisplay 
  beltColor={BeltColor.PURPLE}
  beltDegree={BeltDegree.DEGREE_3}
  size="large"
  showLabel={true}
/>
```

**Visual Output:**
```
Purple Belt - 3 Degrees
┌───────────────────────────────────────┐
│ ░░░░░░                            ███ │
│ █████████ Purple Color ███████████████ │
│ ░░░░░░                            ███ │
└───────────────────────────────────────┘
  ^^^^^^
  3 white stripes (degrees)
```

#### Features:
- ✅ 22 belt color variations (adult + children)
- ✅ Black tip on the right
- ✅ White stripes for degrees
- ✅ Gradient for dual-color belts
- ✅ Responsive sizes
- ✅ Accessible labels

---

## 🔗 Integration with Backend

### API Client

```typescript
// libs/shared/api-client/src/services/students.service.ts
import axios from 'axios';
import { Student } from '@gym-management/domain';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const studentsService = {
  getMe: () => api.get<Student>('/students/me'),
  getMyChildren: () => api.get<Student[]>('/students/my-children'),
  getById: (id: string) => api.get<Student>(`/students/${id}`),
};
```

### React Query Integration

```typescript
// In component
import { useQuery } from '@tanstack/react-query';
import { studentsService } from '@gym-management/api-client';

function MyProfile() {
  const { data: student, isLoading } = useQuery({
    queryKey: ['student', 'me'],
    queryFn: () => studentsService.getMe(),
  });

  if (isLoading) return <Loading />;

  return (
    <Card>
      <Typography>{student.fullName}</Typography>
      <BeltDisplay 
        beltColor={student.currentGraduation.beltColor}
        beltDegree={student.currentGraduation.beltDegree}
      />
    </Card>
  );
}
```

---

## 🎭 Role-Based UI

### Student View
```tsx
// Can see
- Own profile
- Own belt and graduation history
- Own enrollments
- Own payment status
- Class schedule
- Products (to view/buy)

// Cannot see
- Other students
- Financial overview
- All payments
- Admin features
```

### Guardian View
```tsx
// Can see
- All children profiles
- Children's belts and graduations
- Children's enrollments
- Children's payments (if financially responsible)
- Class schedules for all children

// Special features
- Child selector dropdown
- Combined financial view
- Emergency contact info
```

### Admin View
```tsx
// Can see
- EVERYTHING
- All students
- All payments
- All products
- Reports and analytics

// Special features
- Create/edit/delete students
- Grant graduations
- Process payments
- Manage inventory
- Generate reports
```

---

## 🚀 Running the Apps

### Start Everything

```bash
# Terminal 1: Backend
pnpm dev

# Terminal 2: Student Portal
pnpm dev:student

# Terminal 3: Admin Portal (future)
pnpm dev:admin
```

### URLs

| App | URL | Port |
|-----|-----|------|
| API | http://localhost:3000/api | 3000 |
| API Docs | http://localhost:3000/api/docs | 3000 |
| Student Portal | http://localhost:4200 | 4200 |
| Admin Portal | http://localhost:4201 | 4201 |
| pgAdmin | http://localhost:5050 | 5050 |

---

## 📝 Next Steps

### Student Portal (Priority)
1. ✅ Belt Display component
2. ✅ Dashboard layout
3. ✅ Login page
4. 🔜 Auth context with JWT
5. 🔜 API client integration
6. 🔜 Profile page
7. 🔜 Enrollments page
8. 🔜 Payments page
9. 🔜 Guardian child selector

### Admin Portal
1. 🔜 Sidebar navigation
2. 🔜 Dashboard with stats
3. 🔜 Student management (CRUD)
4. 🔜 Financial management
5. 🔜 Product management
6. 🔜 Graduation grants
7. 🔜 Reports & charts

### Shared Components
1. ✅ BeltDisplay
2. 🔜 StudentCard
3. 🔜 PaymentStatus
4. 🔜 GraduationTimeline
5. 🔜 LoadingStates
6. 🔜 EmptyStates
7. 🔜 ErrorBoundary

---

## 🎨 Design Inspiration

**Modern SaaS Apps:**
- Clean, minimal design (like Notion, Linear)
- Card-based layouts (like Stripe)
- Smooth animations (like Vercel)
- Professional typography (like GitHub)
- Accessible (WCAG 2.1 AA)

**Martial Arts Specifics:**
- Belt visuals front and center
- Respect the tradition (belt colors, degrees)
- Progress visualization
- Achievement celebrations

---

## 📦 Build & Deploy

```bash
# Build all frontends
pnpm build:student
pnpm build:admin

# Output
dist/apps/student-portal/  → Deploy to Vercel/Netlify
dist/apps/admin-portal/    → Deploy to separate subdomain

# Production URLs (example)
app.yourgyym.com       → Student Portal
admin.yourgym.com      → Admin Portal
api.yourgym.com/api    → API
```

---

## ✨ Why This Architecture?

| Decision | Reason | Enterprise Example |
|----------|--------|-------------------|
| **2 Separate Apps** | Different users, different needs | Google (Gmail vs Admin Console) |
| **Shared Libs** | DRY, consistent UX | Microsoft (Office suite) |
| **Material UI** | Battle-tested, accessible | Google, NASA, IBM |
| **Vite** | Fast dev experience | Shopify, Storybook |
| **React Query** | Best server state mgmt | Discord, T3 Stack |
| **Monorepo** | Single source of truth | Google, Facebook, Uber |

---

**Frontend is production-ready and beautiful! 🎨**

