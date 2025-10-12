import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { AppThemeProvider } from '@gym-management/ui-components';
import { AdminLayout } from './layout/AdminLayout';
import { DashboardPage } from './pages/Dashboard';
import {
  StudentsListPage,
  StudentFormPage,
  StudentDetailsPage,
} from './pages/Students';
import { GraduationsListPage } from './pages/Graduations';
import { GuardiansListPage, GuardianFormPage } from './pages/Guardians';
import { LoginPage } from './pages/Login';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider adminMode>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              
              {/* Students Routes */}
              <Route path="students" element={<StudentsListPage />} />
              <Route path="students/new" element={<StudentFormPage />} />
              <Route path="students/:id" element={<StudentDetailsPage />} />
              <Route path="students/:id/edit" element={<StudentFormPage />} />
              
              {/* Guardians Routes */}
              <Route path="guardians" element={<GuardiansListPage />} />
              <Route path="guardians/new" element={<GuardianFormPage />} />
              <Route path="guardians/:id/edit" element={<GuardianFormPage />} />
              
              {/* Graduations Routes */}
              <Route path="graduations" element={<GraduationsListPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
