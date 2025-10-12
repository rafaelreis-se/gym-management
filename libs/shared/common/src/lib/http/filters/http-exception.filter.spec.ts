import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    const ctx = mockArgumentsHost.switchToHttp();
    const response = ctx.getResponse();

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/test',
        method: 'GET',
        message: 'Test error',
      })
    );
  });

  it('should handle generic errors', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockArgumentsHost);

    const ctx = mockArgumentsHost.switchToHttp();
    const response = ctx.getResponse();

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      })
    );
  });

  it('should extract message from object response', () => {
    const exception = new HttpException(
      { message: 'Object error' },
      HttpStatus.BAD_REQUEST
    );

    filter.catch(exception, mockArgumentsHost);

    const ctx = mockArgumentsHost.switchToHttp();
    const response = ctx.getResponse();

    expect(response.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Object error',
      })
    );
  });
});
