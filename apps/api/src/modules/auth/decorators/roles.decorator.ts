import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@gym-management/common';

/**
 * Decorator to require specific roles
 * Usage: @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

