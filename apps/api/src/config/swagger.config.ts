import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger configuration for API documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Gym Management API')
    .setDescription(
      'Complete management API for martial arts gyms (Jiu Jitsu and other modalities)'
    )
    .setVersion('1.0')
    .addTag('students', 'Student management')
    .addTag('guardians', 'Guardian management (parents/responsible persons)')
    .addTag('enrollments', 'Enrollment and registration')
    .addTag('graduations', 'Graduation system (belts and degrees)')
    .addTag('financial', 'Financial management (payments and plans)')
    .addTag('products', 'Products and sales')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Gym Management API - Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });
}

