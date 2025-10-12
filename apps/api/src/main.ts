/**
 * Gym Management API
 * Sistema de gestão para academias de artes marciais
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  // Criar aplicação com Fastify (mais performático que Express)
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false })
  );

  // Configurar CORS
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: true,
  });

  // Configurar prefixo global
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Configurar Swagger
  setupSwagger(app);

  // Iniciar servidor
  const port = process.env['PORT'] || 3000;
  const host = process.env['HOST'] || '0.0.0.0';

  await app.listen(port, host);

  const logger = new Logger('Bootstrap');
  logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  logger.log(
    `📚 API Documentation: http://localhost:${port}/${globalPrefix}/docs`
  );
  logger.log(
    `🏥 Health Check: http://localhost:${port}/${globalPrefix}/health`
  );
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
