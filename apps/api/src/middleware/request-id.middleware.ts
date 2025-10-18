import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware avançado para Request ID/Correlation ID e headers de segurança
 * Adiciona identificação única, CORS e headers de segurança
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Generate or use existing Request ID
    const requestId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      this.generateRequestId();

    const correlationId =
      (req.headers['x-correlation-id'] as string) || requestId;

    // Adicionar IDs ao request para uso posterior
    (
      req as Request & { requestId?: string; correlationId?: string }
    ).requestId = requestId;
    (
      req as Request & { requestId?: string; correlationId?: string }
    ).correlationId = correlationId;

    // Headers de resposta
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    // Headers de segurança
    this.setSecurityHeaders(res);

    // Headers CORS
    this.setCorsHeaders(req, res);

    // Log da requisição (apenas para desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`${req.method} ${req.url} - Request ID: ${requestId}`, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection?.remoteAddress,
        requestId,
        correlationId,
      });
    }

    // Interceptar o final da resposta para métricas
    const originalEnd = res.end;
    const logger = this.logger;
    res.end = function (this: Response, ...args: unknown[]) {
      const duration = Date.now() - startTime;

      // Log de performance para requests lentos
      if (duration > 1000) {
        logger.warn(
          `Slow request detected: ${req.method} ${req.url} took ${duration}ms`,
          {
            method: req.method,
            url: req.url,
            duration,
            statusCode: res.statusCode,
            requestId,
          }
        );
      }

      // Adicionar header de tempo de resposta
      res.setHeader('x-response-time', `${duration}ms`);

      return originalEnd.apply(this, args as Parameters<typeof originalEnd>);
    };

    next();
  }

  /**
   * Gera um Request ID único no formato mais legível
   */
  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `req-${timestamp}-${randomPart}`;
  }

  /**
   * Configura headers de segurança
   */
  private setSecurityHeaders(res: Response): void {
    // Previne sniffing de MIME type
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Proteção contra XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Previne clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Remove header que expõe tecnologia
    res.removeHeader('X-Powered-By');

    // Política de referrer
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy básico
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }

  /**
   * Configura headers CORS
   */
  private setCorsHeaders(req: Request, res: Response): void {
    const origin = req.headers.origin;
    const allowedOrigins = this.getAllowedOrigins();

    // Verificar se a origem é permitida
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes('*')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-request-id, x-correlation-id'
    );
    res.setHeader(
      'Access-Control-Expose-Headers',
      'x-request-id, x-correlation-id, x-response-time'
    );

    // Responder a requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  }

  /**
   * Obtém origens permitidas baseadas no ambiente
   */
  private getAllowedOrigins(): string[] {
    if (process.env.NODE_ENV === 'production') {
      return [
        'https://admin.gym-management.com',
        'https://student.gym-management.com',
        // Adicionar outras origens de produção
      ];
    }

    // Desenvolvimento - permitir localhost em várias portas
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'http://localhost:5173',
      'http://localhost:8080',
      '*', // Para desenvolvimento, permitir qualquer origem
    ];
  }
}
