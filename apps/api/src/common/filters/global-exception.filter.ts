import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError as ClassValidatorError } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import {
  ApiResponseUtil,
  ValidationError,
  ApiErrorResponse,
} from '../responses/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers['x-request-id'] as string;
    const correlationId = request.headers['x-correlation-id'] as string;
    const path = request.url;

    const metadata = {
      path,
      requestId,
      correlationId,
    };

    let errorResponse: ApiErrorResponse;

    // Log do erro
    this.logError(exception, request);

    if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, metadata);
    } else if (exception instanceof QueryFailedError) {
      errorResponse = this.handleDatabaseException(exception, metadata);
    } else if (this.isValidationError(exception)) {
      errorResponse = this.handleValidationException(exception, metadata);
    } else {
      errorResponse = this.handleGenericException(exception, metadata);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleHttpException(
    exception: HttpException,
    metadata: { path?: string; requestId?: string; correlationId?: string }
  ): ApiErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Se a resposta já é um objeto com detalhes
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as Record<string, unknown>;

      // Tratar erros de validação do class-validator
      if (response.message && Array.isArray(response.message)) {
        const validationErrors = this.extractValidationErrors(
          response.message as unknown[]
        );
        return ApiResponseUtil.validationError(
          validationErrors,
          'Dados de entrada inválidos',
          metadata
        );
      }

      return ApiResponseUtil.error(
        exception.constructor.name,
        (response.message as string) || exception.message,
        status,
        {
          ...metadata,
          code:
            (response.error as string)?.toUpperCase().replace(' ', '_') ||
            'HTTP_EXCEPTION',
          details: response,
        }
      );
    }

    return ApiResponseUtil.error(
      exception.constructor.name,
      exception.message,
      status,
      {
        ...metadata,
        code: this.getHttpErrorCode(status),
      }
    );
  }

  private handleDatabaseException(
    exception: QueryFailedError,
    metadata: { path?: string; requestId?: string; correlationId?: string }
  ): ApiErrorResponse {
    const error = exception as QueryFailedError & {
      code?: string;
      detail?: string;
      constraint?: string;
      column?: string;
    };

    // Violação de chave única
    if (error.code === '23505') {
      const detail = error.detail || '';
      const match = detail.match(/Key \((.+)\)=\((.+)\) already exists/);

      if (match) {
        const field = match[1];
        const value = match[2];
        return ApiResponseUtil.conflict('Recurso', field, value, metadata);
      }

      return ApiResponseUtil.error(
        'ConflictError',
        'Registro duplicado encontrado',
        HttpStatus.CONFLICT,
        {
          ...metadata,
          code: 'DUPLICATE_ENTRY',
          details: { constraint: error.constraint, detail: error.detail },
        }
      );
    }

    // Violação de chave estrangeira
    if (error.code === '23503') {
      return ApiResponseUtil.error(
        'ReferenceError',
        'Referência inválida para recurso relacionado',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          ...metadata,
          code: 'FOREIGN_KEY_VIOLATION',
          details: { constraint: error.constraint, detail: error.detail },
        }
      );
    }

    // Violação de NOT NULL
    if (error.code === '23502') {
      return ApiResponseUtil.error(
        'ValidationError',
        'Campo obrigatório não fornecido',
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          ...metadata,
          code: 'REQUIRED_FIELD_MISSING',
          details: { column: error.column },
        }
      );
    }

    return ApiResponseUtil.error(
      'DatabaseError',
      'Erro interno do banco de dados',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        ...metadata,
        code: 'DATABASE_ERROR',
        details:
          process.env.NODE_ENV === 'development'
            ? {
                code: error.code,
                detail: error.detail,
              }
            : undefined,
      }
    );
  }

  private handleValidationException(
    exception: ClassValidatorError[],
    metadata: { path?: string; requestId?: string; correlationId?: string }
  ): ApiErrorResponse {
    const validationErrors = this.extractValidationErrors(exception);
    return ApiResponseUtil.validationError(
      validationErrors,
      'Dados de entrada inválidos',
      metadata
    );
  }

  private handleGenericException(
    exception: unknown,
    metadata: { path?: string; requestId?: string; correlationId?: string }
  ): ApiErrorResponse {
    const message =
      exception instanceof Error
        ? exception.message
        : 'Erro interno do servidor';

    return ApiResponseUtil.error(
      'InternalServerError',
      'Erro interno do servidor',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        ...metadata,
        code: 'INTERNAL_SERVER_ERROR',
        details:
          process.env.NODE_ENV === 'development'
            ? { originalMessage: message }
            : undefined,
      }
    );
  }

  private extractValidationErrors(messages: unknown[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const message of messages) {
      if (typeof message === 'string') {
        errors.push({
          field: 'unknown',
          message,
        });
      } else if (typeof message === 'object' && message !== null) {
        const validationMsg = message as {
          property?: string;
          value?: unknown;
          constraints?: Record<string, string>;
        };

        if (validationMsg.constraints) {
          const field = validationMsg.property || 'unknown';
          const constraints = validationMsg.constraints;

          for (const [key, value] of Object.entries(constraints)) {
            errors.push({
              field,
              message: value,
              value: validationMsg.value,
              constraints: { [key]: value },
            });
          }
        }
      }
    }

    return errors;
  }

  private isValidationError(
    exception: unknown
  ): exception is ClassValidatorError[] {
    return (
      Array.isArray(exception) &&
      exception.length > 0 &&
      exception[0] instanceof ClassValidatorError
    );
  }

  private getHttpErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'HTTP_EXCEPTION';
    }
  }

  private logError(exception: unknown, request: Request) {
    const { method, url, headers, body, params, query } = request;
    const userAgent = headers['user-agent'];
    const userId = (request as Request & { user?: { id?: string } }).user?.id;

    const errorContext = {
      method,
      url,
      userAgent,
      userId,
      params,
      query,
      body: this.sanitizeBody(body),
      requestId: headers['x-request-id'],
      correlationId: headers['x-correlation-id'],
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (status >= 500) {
        this.logger.error(
          `HTTP ${status} Error: ${exception.message}`,
          exception.stack,
          errorContext
        );
      } else if (status >= 400) {
        this.logger.warn(
          `HTTP ${status} Warning: ${exception.message}`,
          errorContext
        );
      }
    } else {
      this.logger.error(
        `Unhandled Exception: ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
        exception instanceof Error ? exception.stack : undefined,
        errorContext
      );
    }
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'passwordHash',
      'token',
      'secret',
      'apiKey',
    ];
    const sanitized = { ...(body as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
