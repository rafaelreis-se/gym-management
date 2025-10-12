import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
        synchronize: configService.get('DB_SYNCHRONIZE', false),
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
  ],
})
export class DatabaseModule {}

