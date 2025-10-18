import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { pino } from 'pino';
import type { Request, Response } from 'express';

// Tipos internos para o logger
type LogRequest = Request & {
  id?: string;
  connection?: {
    remoteAddress?: string;
    remotePort?: number;
  };
};

type LogResponse = Response & {
  statusCode: number;
};

interface LogError extends Error {
  statusCode?: number;
  code?: string;
  constructor?: {
    name: string;
  };
}

export const PinoLoggerConfig = LoggerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const isDevelopment = configService.get('NODE_ENV') !== 'production';

    return {
      pinoHttp: {
        level: isDevelopment ? 'debug' : 'info',
        transport: isDevelopment
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                singleLine: false,
                hideObject: false,
                messageFormat: '[{req.method}] {req.url} - {msg}',
              },
            }
          : undefined,
        formatters: {
          level: (label: string) => ({ level: label }),
          bindings: () => ({}),
        },
        base: {
          service: 'gym-management-api',
          environment: configService.get('NODE_ENV') || 'development',
        },
        serializers: {
          req: (req: LogRequest) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            headers: {
              host: req.headers?.host,
              'user-agent': req.headers?.['user-agent'],
              authorization: req.headers?.authorization
                ? 'Bearer ***'
                : undefined,
              'content-type': req.headers?.['content-type'],
              'content-length': req.headers?.['content-length'],
              accept: req.headers?.accept,
            },
            remoteAddress: req.ip || req.connection?.remoteAddress,
            remotePort: req.connection?.remotePort,
          }),
          res: (res: LogResponse) => ({
            statusCode: res.statusCode,
            headers: {
              'content-type': res.getHeader?.('content-type'),
              'content-length': res.getHeader?.('content-length'),
              'x-request-id': res.getHeader?.('x-request-id'),
              'x-correlation-id': res.getHeader?.('x-correlation-id'),
              'access-control-allow-origin': res.getHeader?.(
                'access-control-allow-origin'
              ),
              'access-control-allow-credentials': res.getHeader?.(
                'access-control-allow-credentials'
              ),
            },
          }),
          err: (err: LogError) => ({
            type: err.constructor?.name,
            message: err.message,
            stack: isDevelopment ? err.stack : undefined,
            statusCode: err.statusCode,
            code: err.code,
          }),
        },
        customLogLevel: (req: LogRequest, res: LogResponse, err?: Error) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          if (res.statusCode >= 300) return 'info';
          return 'info';
        },
        genReqId: (req: LogRequest) => {
          return (
            req.headers['x-request-id'] ||
            req.headers['x-correlation-id'] ||
            generateRequestId()
          );
        },
        customAttributeKeys: {
          req: 'req',
          res: 'res',
          err: 'error',
          responseTime: 'responseTime',
        },
        customSuccessMessage: () => {
          return `request completed`;
        },
        customErrorMessage: (
          _req: LogRequest,
          _res: LogResponse,
          err: Error
        ) => {
          return `request failed: ${err.message}`;
        },
        autoLogging: {
          ignore: (req: LogRequest) => {
            // Ignorar logs para health checks e rotas de desenvolvimento
            const ignorePaths = ['/api/health', '/favicon.ico', '/api/docs'];
            return ignorePaths.some((path) => req.url?.startsWith(path));
          },
        },
      },
    };
  },
});

// Gerador de ID de requisição único
function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Logger personalizado para uso direto nos serviços
export const createServiceLogger = (service: string) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return pino({
    level: isDevelopment ? 'debug' : 'info',
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: `[${service.toUpperCase()}] {msg}`,
          },
        }
      : undefined,
    base: {
      service: `gym-management-${service}`,
      environment: process.env.NODE_ENV || 'development',
    },
  });
};

// Tipos para melhor tipagem do logger
export interface LogContext {
  userId?: string;
  requestId?: string;
  correlationId?: string;
  operation?: string;
  resource?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LoggerService {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  fatal(message: string, error?: Error, context?: LogContext): void;
}
