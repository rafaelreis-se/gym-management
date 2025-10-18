import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import 'reflect-metadata';
import {
  ApiResponseUtil,
  ApiResponse,
  PaginatedApiResponse,
} from '../responses/api-response.interface';
import { PaginatedResponse } from '../pagination/pagination.utils';

// Decorator para pular a padronização de resposta
export const SKIP_RESPONSE_TRANSFORM = 'skipResponseTransform';
export const SkipResponseTransform = () =>
  Reflector.createDecorator<boolean>({ key: SKIP_RESPONSE_TRANSFORM });

// Decorator para definir mensagem customizada
export const CUSTOM_RESPONSE_MESSAGE = 'customResponseMessage';
export const ResponseMessage = (message: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(
      CUSTOM_RESPONSE_MESSAGE,
      message,
      descriptor?.value || target
    );
    return descriptor;
  };
};

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM,
      [context.getHandler(), context.getClass()]
    );

    if (skipTransform) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const customMessage = this.reflector.getAllAndOverride<string>(
      CUSTOM_RESPONSE_MESSAGE,
      [context.getHandler(), context.getClass()]
    );

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;
        const path = request.url;
        const requestId = request.headers['x-request-id'] as string;
        const correlationId = request.headers['x-correlation-id'] as string;

        const metadata = {
          path,
          requestId,
          correlationId,
        };

        // Se já é uma resposta padronizada, retorna como está
        if (this.isStandardResponse(data)) {
          return data;
        }

        // Se é uma resposta paginada
        if (this.isPaginatedResponse(data)) {
          const message =
            customMessage || this.getDefaultMessage(statusCode, 'list');
          return ApiResponseUtil.paginated(
            data.data,
            data.meta,
            message,
            statusCode,
            {
              ...metadata,
              links: data.links,
            }
          );
        }

        // Resposta padrão com dados
        const message =
          customMessage || this.getDefaultMessage(statusCode, 'single');

        // Para POST/PUT/PATCH, usar dados diretamente
        // Para DELETE, usar mensagem de sucesso sem dados se não há dados
        if (
          statusCode === HttpStatus.NO_CONTENT ||
          data === null ||
          data === undefined
        ) {
          return ApiResponseUtil.success(
            null,
            message || 'Operação realizada com sucesso',
            statusCode,
            metadata
          );
        }

        return ApiResponseUtil.success(data, message, statusCode, metadata);
      })
    );
  }

  private isStandardResponse(
    data: unknown
  ): data is ApiResponse | PaginatedApiResponse {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'statusCode' in data &&
      'message' in data &&
      'timestamp' in data
    );
  }

  private isPaginatedResponse(
    data: unknown
  ): data is PaginatedResponse<unknown> {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      Array.isArray((data as PaginatedResponse<unknown>).data) &&
      typeof (data as PaginatedResponse<unknown>).meta === 'object'
    );
  }

  private getDefaultMessage(
    statusCode: number,
    type: 'single' | 'list'
  ): string {
    switch (statusCode) {
      case HttpStatus.OK:
        return type === 'list'
          ? 'Dados recuperados com sucesso'
          : 'Operação realizada com sucesso';
      case HttpStatus.CREATED:
        return 'Recurso criado com sucesso';
      case HttpStatus.NO_CONTENT:
        return 'Operação realizada com sucesso';
      default:
        return 'Operação realizada com sucesso';
    }
  }
}

// Decorator helper para facilitar o uso
export const ApiStandardResponse = () => {
  return (
    target: unknown,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Este decorator é usado apenas para indicação, o interceptor fará o trabalho
    return descriptor;
  };
};

// Decorator para respostas que devem ser tratadas como paginadas
export const API_PAGINATED_RESPONSE = 'apiPaginatedResponse';
export const ApiPaginatedResponseType = () =>
  Reflector.createDecorator<boolean>({ key: API_PAGINATED_RESPONSE });
