import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

/**
 * Higher-Order Component to protect routes requiring authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h4" color="error">
          Acesso Negado
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Você não tem permissão para acessar esta página.
          <br />
          Usuário atual: <strong>{user?.email || '(não encontrado)'}</strong> (
          {user?.role || 'sem role'})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Roles necessárias: {requiredRoles.join(', ')}
        </Typography>
      </Box>
    );
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Higher-Order Component for admin-only routes
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ProtectedRoute requiredRoles={['ADMIN']}>{children}</ProtectedRoute>;
};

/**
 * Higher-Order Component for instructor and admin routes
 */
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'INSTRUCTOR']}>
      {children}
    </ProtectedRoute>
  );
};
