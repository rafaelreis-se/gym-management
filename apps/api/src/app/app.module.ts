import {
  Module,
  MiddlewareConsumer,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@gym-management/common';
import { DatabaseModule } from '@gym-management/infrastructure';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { StudentsModule } from '../modules/students/students.module';
import { EnrollmentsModule } from '../modules/enrollments/enrollments.module';
import { GraduationsModule } from '../modules/graduations/graduations.module';
import { FinancialModule } from '../modules/financial/financial.module';
import { ProductsModule } from '../modules/products/products.module';
import { GuardiansModule } from '../modules/guardians/guardians.module';
import { DashboardModule } from '../modules/dashboard/dashboard.module';
import { RequestIdMiddleware } from '../middleware/request-id.middleware';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { PinoLoggerConfig } from '../config/logger.config';
import { ApiResponseInterceptor } from '../common/interceptors/api-response.interceptor';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    PinoLoggerConfig,
    DatabaseModule,

    // Domain modules
    AuthModule,
    StudentsModule,
    GuardiansModule,
    EnrollmentsModule,
    GraduationsModule,
    FinancialModule,
    ProductsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global response interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          // Retorna erros de validação que serão tratados pelo GlobalExceptionFilter
          return errors;
        },
      }),
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
