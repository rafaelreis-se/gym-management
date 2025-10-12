import { DataSource, DataSourceOptions } from 'typeorm';
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
 * Configuration for in-memory SQLite database for integration tests
 * Simulates PostgreSQL behavior
 */
export const testDataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  dropSchema: true,
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
};

export const createTestDataSource = () => {
  return new DataSource(testDataSourceOptions);
};

