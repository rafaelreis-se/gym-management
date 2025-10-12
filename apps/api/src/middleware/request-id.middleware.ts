import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

/**
 * Middleware to add Request ID/Correlation ID to all requests
 * Useful for tracing and debugging
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const requestId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      randomUUID();

    // Add the ID to request for later use
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).requestId = requestId;

    // Add the ID to response header
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', requestId);

    next();
  }
}

