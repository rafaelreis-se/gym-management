import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Interface para metadados de paginação
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Interface para links de paginação
export interface PaginationLinks {
  first?: string;
  last?: string;
  next?: string;
  previous?: string;
  self: string;
}

// Interface para resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

// DTO para parâmetros de paginação
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Número da página (começando do 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page deve ser um número' })
  @Min(1, { message: 'Page deve ser maior que 0' })
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit deve ser um número' })
  @Min(1, { message: 'Limit deve ser maior que 0' })
  @Max(100, { message: 'Limit cannot be greater than 100' })
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Termo de busca geral',
    example: 'João',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

// Classe utilitária para paginação
export class PaginationUtils {
  /**
   * Calcula offset baseado na página e limite
   */
  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calcula número total de páginas
   */
  static getTotalPages(totalItems: number, limit: number): number {
    return Math.ceil(totalItems / limit);
  }

  /**
   * Cria metadados de paginação
   */
  static createMeta(
    page: number,
    limit: number,
    totalItems: number
  ): PaginationMeta {
    const totalPages = this.getTotalPages(totalItems, limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Cria links de paginação
   */
  static createLinks(
    baseUrl: string,
    page: number,
    limit: number,
    totalPages: number,
    queryParams: Record<string, string> = {}
  ): PaginationLinks {
    const createUrl = (pageNum: number) => {
      try {
        // Try to create URL directly if baseUrl is absolute
        const url = new URL(baseUrl);
        url.searchParams.set('page', pageNum.toString());
        url.searchParams.set('limit', limit.toString());

        // Add other query parameters
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value && key !== 'page' && key !== 'limit') {
            url.searchParams.set(key, value);
          }
        });

        return url.toString();
      } catch {
        // If baseUrl is relative, construct URL manually
        const [path, existingQuery] = baseUrl.split('?');
        const urlParams = new URLSearchParams(existingQuery || '');

        urlParams.set('page', pageNum.toString());
        urlParams.set('limit', limit.toString());

        // Add other query parameters
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value && key !== 'page' && key !== 'limit') {
            urlParams.set(key, value);
          }
        });

        return `${path}?${urlParams.toString()}`;
      }
    };

    const links: PaginationLinks = {
      self: createUrl(page),
      first: createUrl(1),
      last: createUrl(totalPages),
    };

    if (page > 1) {
      links.previous = createUrl(page - 1);
    }

    if (page < totalPages) {
      links.next = createUrl(page + 1);
    }

    return links;
  }

  /**
   * Cria resposta paginada completa
   */
  static createResponse<T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
    baseUrl?: string,
    queryParams?: Record<string, string>
  ): PaginatedResponse<T> {
    const meta = this.createMeta(page, limit, totalItems);

    const response: PaginatedResponse<T> = {
      data,
      meta,
    };

    if (baseUrl) {
      response.links = this.createLinks(
        baseUrl,
        page,
        limit,
        meta.totalPages,
        queryParams
      );
    }

    return response;
  }

  /**
   * Valida parâmetros de paginação
   */
  static validateParams(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1) {
      throw new Error('Limit must be greater than 0');
    }

    if (limit > 100) {
      throw new Error('Limit cannot be greater than 100');
    }
  }

  /**
   * Normaliza parâmetros de paginação com valores padrão
   */
  static normalizeParams(
    page?: number,
    limit?: number
  ): { page: number; limit: number } {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = Math.min(100, Math.max(1, limit || 10));

    return {
      page: normalizedPage,
      limit: normalizedLimit,
    };
  }

  /**
   * Cria opções para TypeORM baseadas nos parâmetros de paginação
   */
  static createTypeOrmOptions(
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): {
    skip: number;
    take: number;
    order?: Record<string, 'ASC' | 'DESC'>;
  } {
    const { page: normalizedPage, limit: normalizedLimit } =
      this.normalizeParams(page, limit);

    const options = {
      skip: this.getOffset(normalizedPage, normalizedLimit),
      take: normalizedLimit,
      order: undefined as Record<string, 'ASC' | 'DESC'> | undefined,
    };

    if (sortBy) {
      options.order = {
        [sortBy]: sortOrder || 'DESC',
      };
    }

    return options;
  }

  /**
   * Cria WHERE clause para busca textual em múltiplos campos
   */
  static createSearchWhere(
    searchTerm?: string,
    searchFields: string[] = []
  ): Record<string, string>[] {
    if (!searchTerm || searchFields.length === 0) {
      return [];
    }

    return searchFields.map((field) => ({
      [field]: `ILIKE('%${searchTerm}%')`,
    }));
  }
}
