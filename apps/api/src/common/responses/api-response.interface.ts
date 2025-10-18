import { ApiProperty } from '@nestjs/swagger';
import {
  PaginationMeta,
  PaginationLinks,
} from '../pagination/pagination.utils';

// Status codes para respostas padronizadas
export enum ApiStatusCode {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// Type alias to make HttpStatus compatible with ApiStatusCode
export type ApiStatusCodeType = ApiStatusCode | number;

// Interface base para todas as respostas da API
export interface BaseApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  requestId?: string;
  correlationId?: string;
}

// Interface para respostas com dados
export interface ApiResponse<T = unknown> extends BaseApiResponse {
  data: T;
}

// Interface para respostas paginadas
export interface PaginatedApiResponse<T = unknown> extends BaseApiResponse {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

// Interface for error responses
export interface ApiErrorResponse extends BaseApiResponse {
  error: {
    type: string;
    code?: string;
    details?: Record<string, unknown>;
    validation?: ValidationError[];
  };
}

// Interface for validation errors
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

// Classes DTO para documentação Swagger

export class BaseApiResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se a operação foi bem-sucedida',
  })
  success: boolean;

  @ApiProperty({ example: 200, description: 'Código de status HTTP' })
  statusCode: number;

  @ApiProperty({
    example: 'Operação realizada com sucesso',
    description: 'Mensagem de retorno',
  })
  message: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp da resposta',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/students',
    description: 'Caminho da requisição',
  })
  path: string;

  @ApiProperty({
    example: 'req-123abc',
    description: 'ID único da requisição',
    required: false,
  })
  requestId?: string;

  @ApiProperty({
    example: 'corr-456def',
    description: 'ID de correlação para rastreamento',
    required: false,
  })
  correlationId?: string;
}

export class ApiResponseDto<T> extends BaseApiResponseDto {
  @ApiProperty({ description: 'Dados de retorno da operação' })
  data: T;
}

export class ValidationErrorDto {
  @ApiProperty({
    example: 'email',
    description: 'Field that contains the error',
  })
  field: string;

  @ApiProperty({
    example: 'Email deve ser um endereço válido',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 'invalid-email',
    description: 'Value that caused the error',
    required: false,
  })
  value?: unknown;

  @ApiProperty({
    example: { isEmail: 'Email deve ser um endereço válido' },
    description: 'Restrições de validação',
    required: false,
  })
  constraints?: Record<string, string>;
}

export class ApiErrorDto {
  @ApiProperty({ example: 'ValidationError', description: 'Error type' })
  type: string;

  @ApiProperty({
    example: 'VALIDATION_FAILED',
    description: 'Internal error code',
    required: false,
  })
  code?: string;

  @ApiProperty({ description: 'Additional error details', required: false })
  details?: Record<string, unknown>;

  @ApiProperty({
    type: [ValidationErrorDto],
    description: 'Specific validation errors',
    required: false,
  })
  validation?: ValidationError[];
}

export class ApiErrorResponseDto extends BaseApiResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    type: ApiErrorDto,
    description: 'Informações detalhadas do erro',
  })
  error: ApiErrorDto;
}

// Utility class para criação de respostas padronizadas
export class ApiResponseUtil {
  /**
   * Cria uma resposta de sucesso com dados
   */
  static success<T>(
    data: T,
    message = 'Operação realizada com sucesso',
    statusCode = ApiStatusCode.SUCCESS,
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
    }
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: metadata?.path || '',
      requestId: metadata?.requestId,
      correlationId: metadata?.correlationId,
    };
  }

  /**
   * Cria uma resposta paginada
   */
  static paginated<T>(
    data: T[],
    meta: PaginationMeta,
    message = 'Dados recuperados com sucesso',
    statusCode = ApiStatusCode.SUCCESS,
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
      links?: PaginationLinks;
    }
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta,
      links: metadata?.links,
      timestamp: new Date().toISOString(),
      path: metadata?.path || '',
      requestId: metadata?.requestId,
      correlationId: metadata?.correlationId,
    };
  }

  /**
   * Cria uma resposta de erro
   */
  static error(
    type: string,
    message: string,
    statusCode: ApiStatusCodeType = ApiStatusCode.INTERNAL_SERVER_ERROR,
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
      code?: string;
      details?: Record<string, unknown>;
      validation?: ValidationError[];
    }
  ): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      message,
      error: {
        type,
        code: metadata?.code,
        details: metadata?.details,
        validation: metadata?.validation,
      },
      timestamp: new Date().toISOString(),
      path: metadata?.path || '',
      requestId: metadata?.requestId,
      correlationId: metadata?.correlationId,
    };
  }

  /**
   * Cria uma resposta de erro de validação
   */
  static validationError(
    validation: ValidationError[],
    message = 'Dados de entrada inválidos',
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
    }
  ): ApiErrorResponse {
    return this.error(
      'ValidationError',
      message,
      ApiStatusCode.UNPROCESSABLE_ENTITY,
      {
        ...metadata,
        code: 'VALIDATION_FAILED',
        validation,
      }
    );
  }

  /**
   * Cria uma resposta de não encontrado
   */
  static notFound(
    resource: string,
    identifier?: string | number,
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
    }
  ): ApiErrorResponse {
    const message = identifier
      ? `${resource} com ID '${identifier}' não encontrado`
      : `${resource} não encontrado`;

    return this.error('NotFoundError', message, ApiStatusCode.NOT_FOUND, {
      ...metadata,
      code: 'RESOURCE_NOT_FOUND',
      details: { resource, identifier },
    });
  }

  /**
   * Cria uma resposta de não autorizado
   */
  static unauthorized(
    message = 'Acesso não autorizado',
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
    }
  ): ApiErrorResponse {
    return this.error(
      'UnauthorizedError',
      message,
      ApiStatusCode.UNAUTHORIZED,
      {
        ...metadata,
        code: 'UNAUTHORIZED_ACCESS',
      }
    );
  }

  /**
   * Cria uma resposta de conflito
   */
  static conflict(
    resource: string,
    field: string,
    value: string,
    metadata?: {
      path?: string;
      requestId?: string;
      correlationId?: string;
    }
  ): ApiErrorResponse {
    const message = `${resource} com ${field} '${value}' já existe`;

    return this.error('ConflictError', message, ApiStatusCode.CONFLICT, {
      ...metadata,
      code: 'RESOURCE_CONFLICT',
      details: { resource, field, value },
    });
  }
}
