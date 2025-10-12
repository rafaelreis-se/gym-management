# Gym Management System

Complete management system for martial arts gyms (Jiu Jitsu and other modalities).

## 🚀 Features

### Core Modules

- **👥 Students Management**

  - Complete student registration with personal data
  - Medical observations and emergency contacts
  - Student status tracking (Active, Inactive, Suspended, Cancelled)
  - Age category classification (Child/Adult)

- **📋 Enrollments**

  - Student enrollment in specific modalities
  - Plan assignment and tracking
  - Enrollment period management
  - Active/inactive status control

- **🥋 Graduation System**

  - Belt and degree tracking for Jiu Jitsu
  - Complete graduation history
  - Support for both adult and children belt systems
  - Multiple modalities support

- **💰 Financial Management**

  - Payment tracking and installments
  - Multiple payment methods (Cash, Card, Bank Slip, PIX, etc.)
  - Payment status management
  - Overdue payment tracking
  - Membership plans (Monthly, Quarterly, Semi-annual, Annual)
  - Discount management

- **🛍️ Products & Sales**
  - Sports equipment inventory (Kimonos, Belts, Shirts, etc.)
  - Stock management
  - Sales transactions
  - Low stock alerts

## 🏗️ Architecture

### Monorepo Structure

```
gym-management/
├── apps/
│   └── api/                    # Main NestJS application
│       ├── src/
│       │   ├── app/           # App module and core files
│       │   ├── config/        # Configuration files (Swagger, etc.)
│       │   ├── middleware/    # Request ID middleware
│       │   ├── modules/       # Domain modules
│       │   │   ├── students/
│       │   │   ├── enrollments/
│       │   │   ├── graduations/
│       │   │   ├── financial/
│       │   │   └── products/
│       │   └── validators/    # Custom validators (CPF, etc.)
│       └── main.ts
│
└── libs/
    └── shared/
        ├── common/            # Shared utilities, enums, configs
        │   ├── enums/         # Business enums
        │   ├── config/        # Config module and schemas
        │   ├── logger/        # Pino logger configuration
        │   └── http/          # HTTP filters, pagination, etc.
        │
        ├── domain/            # Domain entities
        │   └── entities/      # TypeORM entities
        │
        └── infrastructure/    # Infrastructure layer
            └── database/      # Database config and abstracts
```

### Technology Stack

- **Framework**: NestJS 11
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm 10+
- **Monorepo**: Nx 21
- **Database**: PostgreSQL + TypeORM
- **HTTP Server**: Fastify
- **Validation**: class-validator + Joi
- **Logging**: Pino + pino-pretty
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Design Patterns & Best Practices

- ✅ **Clean Architecture** with layered approach (Domain, Application, Infrastructure)
- ✅ **Repository Pattern** with abstract base repository
- ✅ **DTOs** for request/response validation
- ✅ **Global Exception Filter** for standardized error responses
- ✅ **Request ID Middleware** for distributed tracing
- ✅ **Environment Variables** validation with Joi schemas
- ✅ **Code Coverage** thresholds (80% for shared libs)
- ✅ **Swagger Documentation** auto-generated from decorators

## 🚦 Getting Started

### Prerequisites

```bash
node >= 20.0.0
pnpm >= 10.0.0
PostgreSQL >= 14
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gym-management

# Install dependencies
pnpm install
```

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Configure your environment variables:

```env
# Application
NODE_ENV=development
PORT=3000
SERVICE_NAME=gym-management-api

# Logging
LOG_LEVEL=info
LOG_FORMAT=pretty

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=gym_management
DB_SYNCHRONIZE=true  # Set to false in production
DB_LOGGING=true
```

### Database Setup

```bash
# Create database
createdb gym_management

# Run migrations (when available)
pnpm db:run
```

### Running the Application

```bash
# Development mode with hot reload
pnpm dev

# Debug mode
pnpm debug

# Production mode
pnpm build
pnpm start
```

The API will be available at:

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Run affected tests only
pnpm test:affected

# Test coverage
pnpm test:coverage
```

## 🔍 Linting & Formatting

```bash
# Lint affected files
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm lint:format
```

## 🏗️ Building

```bash
# Build API
pnpm build

# Build all projects
pnpm build:all

# Build only affected projects
pnpm build:affected
```

## 📚 API Documentation

### Swagger/OpenAPI

Access the interactive API documentation at: http://localhost:3000/api/docs

### Main Endpoints

#### Students

- `POST /api/students` - Create new student
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student by ID
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

#### Enrollments

- `POST /api/enrollments` - Create enrollment
- `GET /api/enrollments` - List all enrollments
- `GET /api/enrollments/student/:studentId` - Get student enrollments

#### Graduations

- `POST /api/graduations` - Record graduation
- `GET /api/graduations` - List all graduations
- `GET /api/graduations/student/:studentId` - Get student graduations
- `GET /api/graduations/student/:studentId/current` - Get current graduation

#### Financial

- `POST /api/financial/payments` - Create payment
- `GET /api/financial/payments/pending` - List pending payments
- `GET /api/financial/payments/overdue` - List overdue payments
- `PATCH /api/financial/payments/:id/mark-as-paid` - Mark as paid
- `POST /api/financial/plans` - Create plan
- `GET /api/financial/plans/active` - List active plans

#### Products

- `POST /api/products` - Create product
- `GET /api/products/active` - List active products
- `GET /api/products/low-stock` - Check low stock products
- `POST /api/products/sales` - Create sale
- `GET /api/products/sales` - List sales

## 🔧 Maintenance

```bash
# Clear node_modules
pnpm clean

# Deep clean (including dist)
pnpm clean:all

# Reset NX cache
pnpm reset:cache
```

## 🎯 Graduation System

### Adult Belt System

- White → Blue → Purple → Brown → Black → Red/Black (Coral) → Red/White → Red

### Children Belt System

- Gray/White → Gray → Gray/Black
- Yellow/White → Yellow → Yellow/Black
- Orange/White → Orange → Orange/Black
- Green/White → Green → Green/Black

Each belt can have multiple degrees (stripes) to track progress within the belt level.

## 📝 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using NestJS, Nx, and PostgreSQL**
