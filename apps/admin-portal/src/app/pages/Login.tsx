import React from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';

export const LoginPage: React.FC = () => {
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
              Admin Portal
            </Typography>
          </Box>

          <TextField fullWidth label="Email" margin="normal" type="email" />
          <TextField fullWidth label="Password" margin="normal" type="password" />

          <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }}>
            Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

