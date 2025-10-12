import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  CssBaseline, 
  Container, 
  Typography, 
  Box, 
  Button,
  ThemeProvider,
  createTheme,
  IconButton,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material';
import { Brightness4, Brightness7, Home, Language } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@gym-management/ui-components';

export function App() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { 
            main: mode === 'light' ? '#DC1F26' : '#E84A4F', // Gracie Barra Red
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar 
          position="sticky"
          sx={{ 
            bgcolor: mode === 'light' ? '#B81519' : '#DC1F26', // Darker red in light mode
          }}
        >
          <Toolbar>
            <IconButton
              component={Link}
              to="/"
              edge="start"
              sx={{ mr: 2, color: 'white' }}
            >
              <Home />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
              {t('student-portal')}
            </Typography>
            <LanguageSwitcher />
            <IconButton onClick={toggleTheme} sx={{ color: 'white' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function HomePage() {
  const { t } = useTranslation();
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h2" gutterBottom>
        🥋 {t('gracie-barra-araxa')}
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        {t('welcome.student')}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          component={Link}
          to="/dashboard"
          sx={{ mr: 2 }}
        >
          {t('dashboard')}
        </Button>
        <Button variant="outlined" component={Link} to="/login">
          {t('login')}
        </Button>
      </Box>
    </Container>
  );
}

function DashboardPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4">Student Dashboard</Typography>
      <Typography color="text.secondary">
        Your progress and information
      </Typography>
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        Back to Home
      </Button>
    </Container>
  );
}

function LoginPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <Typography color="text.secondary">
        Sign in to access your account
      </Typography>
      <Button component={Link} to="/" sx={{ mt: 2 }}>
        Back to Home
      </Button>
    </Container>
  );
}

export default App;
