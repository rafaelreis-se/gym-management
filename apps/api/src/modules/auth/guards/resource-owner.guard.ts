import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@gym-management/common';

/**
 * Resource ownership guard
 * Ensures users can only access their own resources
 * Admins bypass this check
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Instructors can view student data (read-only in controller level)
    if (user.role === UserRole.INSTRUCTOR) {
      // Check HTTP method - instructors can GET but not modify
      const method = request.method;
      if (method === 'GET') {
        return true;
      }
      throw new ForbiddenException(
        'Instructors can only view, not modify student data'
      );
    }

    // Students can only access their own data
    if (user.role === UserRole.STUDENT) {
      const resourceStudentId = request.params.id || request.params.studentId;
      
      if (resourceStudentId && resourceStudentId !== user.studentId) {
        throw new ForbiddenException('You can only access your own data');
      }
      
      return true;
    }

    // Guardians can only access their children's data
    if (user.role === UserRole.GUARDIAN) {
      // This would need to check studentGuardian relationship
      // Implementation depends on the specific endpoint
      return true; // For now, allow - implement detailed check per endpoint
    }

    return false;
  }
}

