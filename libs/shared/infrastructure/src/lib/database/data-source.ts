import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Student,
  Enrollment,
  Graduation,
  Plan,
  Payment,
  Product,
  Sale,
  SaleItem,
  Guardian,
  StudentGuardian,
  User,
  RefreshToken,
} from '@gym-management/domain';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_NAME', 'gym_management'),
  entities: [
    Student,
    Enrollment,
    Graduation,
    Plan,
    Payment,
    Product,
    Sale,
    SaleItem,
    Guardian,
    StudentGuardian,
    User,
    RefreshToken,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: configService.get('DB_LOGGING', false),
});
