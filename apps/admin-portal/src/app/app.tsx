import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { AppThemeProvider } from '@gym-management/ui-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { ProtectedRoute, StaffRoute } from './components/ProtectedRoute';
import { authService } from './services/auth.service';

const queryClient = new QueryClient();

export function App() {
  useEffect(() => {
    // Initialize auth service on app start
    authService.initialize();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider adminMode>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />

              {/* Students Routes - Require Staff Role */}
              <Route
                path="students"
                element={
                  <StaffRoute>
                    <StudentsListPage />
                  </StaffRoute>
                }
              />
              <Route
                path="students/new"
                element={
                  <StaffRoute>
                    <StudentFormPage />
                  </StaffRoute>
                }
              />
              <Route
                path="students/:id"
                element={
                  <StaffRoute>
                    <StudentDetailsPage />
                  </StaffRoute>
                }
              />
              <Route
                path="students/:id/edit"
                element={
                  <StaffRoute>
                    <StudentFormPage />
                  </StaffRoute>
                }
              />

              {/* Guardians Routes - Require Staff Role */}
              <Route
                path="guardians"
                element={
                  <StaffRoute>
                    <GuardiansListPage />
                  </StaffRoute>
                }
              />
              <Route
                path="guardians/new"
                element={
                  <StaffRoute>
                    <GuardianFormPage />
                  </StaffRoute>
                }
              />
              <Route
                path="guardians/:id/edit"
                element={
                  <StaffRoute>
                    <GuardianFormPage />
                  </StaffRoute>
                }
              />

              {/* Graduations Routes - Require Staff Role */}
              <Route
                path="graduations"
                element={
                  <StaffRoute>
                    <GraduationsListPage />
                  </StaffRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
