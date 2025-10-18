import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../services/auth.service';

export const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from navigation state
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(credentials);
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(''); // Clear error on input change
    };

  // Show loading if checking authentication
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <AdminPanelSettings sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700} mt={2}>
              Gracie Barra Araxá
            </Typography>
            <Typography color="text.secondary">
              Portal Administrativo
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={credentials.email}
              onChange={handleChange('email')}
              disabled={isSubmitting}
              required
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              value={credentials.password}
              onChange={handleChange('password')}
              disabled={isSubmitting}
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={
                isSubmitting || !credentials.email || !credentials.password
              }
              sx={{ mt: 3 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </Box>

          {/* Development helper */}
          {process.env.NODE_ENV === 'development' && (
            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Desenvolvimento:</strong>
                <br />
                Email: admin@gym.local
                <br />
                Senha: admin@77d788080ad3f3f8!
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setCredentials({
                    email: 'admin@gym.local',
                    password: 'admin@77d788080ad3f3f8!',
                  });
                }}
                sx={{ mt: 1 }}
              >
                Preencher Automaticamente
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
