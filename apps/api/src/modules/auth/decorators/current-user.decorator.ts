import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@gym-management/domain';

/**
 * Decorator to get current authenticated user
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

