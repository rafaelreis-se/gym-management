import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Student,
  Guardian,
  StudentGuardian,
  Graduation,
  User,
  RefreshToken,
  Enrollment,
  Plan,
  Payment,
  Product,
  Sale,
  SaleItem,
} from '@gym-management/domain';

/**
 * Configuration for PostgreSQL test database using Testcontainers
 *
 * This uses a real PostgreSQL instance in Docker container for tests
 * - 100% compatible with production database
 * - Isolated and automatically cleaned up
 * - Best practice for integration testing
 *
 * Note: Requires Docker to be running
 */
export const getTestDatabaseConfig = (
  host: string,
  port: number,
  database: string,
  username: string,
  password: string
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host,
  port,
  database,
  username,
  password,
  synchronize: true, // Auto-create schema for tests
  dropSchema: true, // Clean schema before tests
  entities: [
    Student,
    Guardian,
    StudentGuardian,
    Graduation,
    User,
    RefreshToken,
    Enrollment,
    Plan,
    Payment,
    Product,
    Sale,
    SaleItem,
  ],
  logging: false,
});
