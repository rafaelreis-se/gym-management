import React from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
} from '@mui/material';
import { Google, Facebook } from '@mui/icons-material';

export const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
            Gym Management
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mb={4}
          >
            Student & Guardian Portal
          </Typography>

          <Box component="form" noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              variant="outlined"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              sx={{ mb: 1.5 }}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Facebook />}
            >
              Continue with Facebook
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

