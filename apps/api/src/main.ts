/**
 * Gym Management API
 * Sistema de gestão para academias de artes marciais com estrutura empresarial
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  // Criar aplicação com Express (melhor compatibilidade com middlewares)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  // Configurar trust proxy para deployment
  app.set('trust proxy', 1);

  // Configurar CORS avançado
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();

      // Permitir requisições sem origem (ex: aplicações mobile/desktop)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-request-id',
      'x-correlation-id',
    ],
    exposedHeaders: ['x-request-id', 'x-correlation-id', 'x-response-time'],
    maxAge: 86400, // 24 horas
  });

  // Configurar prefixo global
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Configuração adicional de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    })
  );

  // Configurar Swagger
  setupSwagger(app);

  // Configurar graceful shutdown
  setupGracefulShutdown(app);

  // Iniciar servidor
  const port = process.env['PORT'] || 3000;
  const host = process.env['HOST'] || '0.0.0.0';

  await app.listen(port, host);

  const logger = new Logger('Bootstrap');
  logger.log(
    `🚀 Application is running on: http://${
      host === '0.0.0.0' ? 'localhost' : host
    }:${port}/${globalPrefix}`
  );
  logger.log(
    `📚 API Documentation: http://localhost:${port}/${globalPrefix}/docs`
  );
  logger.log(
    `🏥 Health Check: http://localhost:${port}/${globalPrefix}/health`
  );
  logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}

/**
 * Obtém origens permitidas baseadas no ambiente
 */
function getAllowedOrigins(): string[] {
  if (process.env.NODE_ENV === 'production') {
    return [
      'https://admin.gym-management.com',
      'https://student.gym-management.com',
    ];
  }

  // Desenvolvimento - permitir localhost
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4200',
    'http://localhost:5173',
    '*',
  ];
}

/**
 * Configura graceful shutdown
 */
function setupGracefulShutdown(app: NestExpressApplication): void {
  const logger = new Logger('Shutdown');

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, starting graceful shutdown');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, starting graceful shutdown');
    await app.close();
    process.exit(0);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
