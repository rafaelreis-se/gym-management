import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'gym_management',

  // Usar entidades compiladas para CLI (sem dependências externas)
  entities: ['dist/entities-for-cli/*.entity.js'],

  // Migrations compiladas
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations',

  // Configurações
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',

  // Para desenvolvimento
  dropSchema: false,

  // SSL para produção (se necessário)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});
