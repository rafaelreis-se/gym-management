import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Gym Management API')
    .setDescription(
      `
# API de Gerenciamento de Academia

Esta é uma API REST completa para gerenciamento de academias de artes marciais, oferecendo funcionalidades para:

## 🥋 Principais Funcionalidades

- **Gestão de Alunos**: Cadastro, matrícula, acompanhamento de progresso
- **Sistema de Graduações**: Controle de faixas e graus por modalidade
- **Gestão Financeira**: Planos, pagamentos, mensalidades
- **Responsáveis/Guardiões**: Gestão de responsáveis legais e contatos de emergência
- **Produtos e Vendas**: Controle de estoque e vendas de produtos
- **Autenticação e Autorização**: Sistema completo com JWT e controle de acesso

## 🔐 Autenticação

A API utiliza autenticação JWT (Bearer Token). Para acessar endpoints protegidos:

1. Faça login através do endpoint \`/auth/login\`
2. Use o token retornado no header \`Authorization: Bearer {token}\`
3. Tokens de desenvolvimento estão disponíveis em \`/auth/dev-tokens\`

## 📊 Padrão de Respostas

Todas as respostas seguem um padrão consistente com \`success\`, \`statusCode\`, \`message\`, \`data\`, \`timestamp\`, \`path\` e \`requestId\`.

## 🔄 Paginação

Endpoints que retornam listas suportam paginação através dos parâmetros:
- \`page\`: Número da página (padrão: 1)
- \`limit\`: Itens por página (padrão: 10, máximo: 100)
- \`sortBy\`: Campo para ordenação
- \`sortOrder\`: Direção da ordenação (ASC/DESC)
- \`search\`: Termo de busca geral
    `
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Endpoints de saúde e status da API')
    .addTag('Authentication', 'Autenticação e autorização')
    .addTag('Students', 'Gestão de alunos')
    .addTag('Guardians', 'Gestão de responsáveis/guardiões')
    .addTag('Enrollments', 'Matrículas e inscrições')
    .addTag('Graduations', 'Sistema de graduações e faixas')
    .addTag('Financial', 'Gestão financeira - planos e pagamentos')
    .addTag('Products', 'Produtos e vendas')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Authentication',
        description:
          'Token JWT para autenticação. Obtenha através do endpoint /auth/login',
        in: 'header',
      },
      'JWT'
    )
    .addServer(
      configService.get('API_URL') || 'http://localhost:3000',
      'Servidor de Desenvolvimento'
    )
    .setContact(
      'Equipe de Desenvolvimento',
      'https://github.com/your-repo',
      'dev@gym-management.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey}_${methodKey}`;
    },
    deepScanRoutes: true,
  });

  // Configurações customizadas do Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Gym Management API - Documentação',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1f2937; }
      .swagger-ui .info .description { color: #374151; }
      .swagger-ui .scheme-container { background: #f9fafb; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
    },
  });

  console.log(
    `📚 Swagger documentation available at: ${
      configService.get('API_URL') || 'http://localhost:3000'
    }/api/docs`
  );
}
