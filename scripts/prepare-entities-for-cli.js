const fs = require('fs');
const path = require('path');

// Diretórios
const entitiesDir = path.join(
  __dirname,
  '../libs/shared/domain/src/lib/entities'
);
const cliEntitiesDir = path.join(__dirname, '../src/entities-for-cli');

// Criar diretório se não existir
if (!fs.existsSync(cliEntitiesDir)) {
  fs.mkdirSync(cliEntitiesDir, { recursive: true });
}

// Definir enums diretamente no código
const enumDefinitions = `
// Enums definidos localmente para evitar dependências
enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  GUARDIAN = 'guardian',
  STUDENT = 'student'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  PIX = 'pix'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

enum GraduationLevel {
  WHITE = 'white',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  BROWN = 'brown',
  BLACK = 'black'
}

enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

enum AgeCategory {
  KIDS = 'kids',
  TEENS = 'teens',
  ADULTS = 'adults'
}

enum GuardianRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

enum Modality {
  BRAZILIAN_JIU_JITSU = 'bjj',
  MUAY_THAI = 'muay_thai',
  MMA = 'mma',
  FITNESS = 'fitness'
}

enum BeltColor {
  WHITE = 'white',
  BLUE = 'blue',
  PURPLE = 'purple',
  BROWN = 'brown',
  BLACK = 'black'
}

enum BeltDegree {
  NONE = 0,
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4
}

enum PlanType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual'
}

enum ProductCategory {
  EQUIPMENT = 'equipment',
  APPAREL = 'apparel',
  SUPPLEMENTS = 'supplements',
  ACCESSORIES = 'accessories'
}

`;

// Ler todos os arquivos de entidade
const entityFiles = fs
  .readdirSync(entitiesDir)
  .filter((file) => file.endsWith('.entity.ts'));

entityFiles.forEach((file) => {
  const filePath = path.join(entitiesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remover imports problemáticos
  content = content.replace(
    /import.*from\s+['"]@gym-management\/types['"];?\n?/g,
    ''
  );
  content = content.replace(
    /import.*from\s+['"]\.\.\/\.\.\/\.\.\/types\/src\/lib\/.*['"];?\n?/g,
    ''
  );

  // Adicionar definições de enum no início
  content = enumDefinitions + '\n' + content;

  // Corrigir union types problemáticos no @Column
  content = content.replace(
    /enum: '[^']+'\s*\|\s*'[^']+'\s*(\|\s*'[^']+')*,/g,
    function (match) {
      if (match.includes('pending') && match.includes('paid')) {
        return 'enum: PaymentStatus,';
      }
      if (match.includes('credit_card') && match.includes('debit_card')) {
        return 'enum: PaymentMethod,';
      }
      if (match.includes('admin') && match.includes('guardian')) {
        return 'enum: UserRole,';
      }
      return match;
    }
  );

  // Corrigir defaults problemáticos
  content = content.replace(
    /default: '[^']+'\s*\|\s*'[^']+'\s*(\|\s*'[^']+')*\.[A-Z_]+,/g,
    function (match) {
      if (match.includes('pending') && match.includes('PENDING')) {
        return 'default: PaymentStatus.PENDING,';
      }
      if (match.includes('pending') && match.includes('PAID')) {
        return 'default: PaymentStatus.PAID,';
      }
      if (match.includes('admin') && match.includes('STUDENT')) {
        return 'default: UserRole.STUDENT,';
      }
      return match;
    }
  );

  // Escrever arquivo simplificado
  const outputPath = path.join(cliEntitiesDir, file);
  fs.writeFileSync(outputPath, content);

  console.log(`✓ Preparado: ${file}`);
});

console.log(
  `\n✅ ${entityFiles.length} entidades preparadas para CLI em: ${cliEntitiesDir}`
);
