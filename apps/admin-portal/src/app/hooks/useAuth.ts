import { useState, useEffect } from 'react';
import {
  authService,
  AuthState,
  LoginRequest,
  User,
} from '../services/auth.service';

/**
 * Custom React hook for authentication
 * Provides reactive authentication state and methods
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState);

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    await authService.login(credentials);
  };

  const logout = (): void => {
    authService.logout();
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(roles);
  };

  return {
    // State
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,

    // Methods
    login,
    logout,
    hasRole,
    hasAnyRole,

    // Computed properties
    isAdmin: hasRole('ADMIN'),
    isInstructor: hasRole('INSTRUCTOR'),
    isStudent: hasRole('STUDENT'),
    isGuardian: hasRole('GUARDIAN'),
    canManageStudents: hasAnyRole(['ADMIN', 'INSTRUCTOR']),
    canManageGuardians: hasAnyRole(['ADMIN', 'INSTRUCTOR']),
  };
};

/**
 * Hook for getting current user info
 */
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

/**
 * Hook for checking authentication status
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};
