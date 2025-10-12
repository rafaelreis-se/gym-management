import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { AppThemeProvider } from '@gym-management/ui-components';
import { AdminLayout } from './layout/AdminLayout';
import { DashboardPage } from './pages/Dashboard';
import { StudentsListPage } from './pages/Students/StudentsList';
import { StudentFormPage } from './pages/Students/StudentForm';
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
              <Route path="students" element={<StudentsListPage />} />
              <Route path="students/new" element={<StudentFormPage />} />
              <Route path="students/:id/edit" element={<StudentFormPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
