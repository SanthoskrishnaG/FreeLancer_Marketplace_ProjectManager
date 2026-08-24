import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar, Footer, ProtectedRoute } from './components/index.js';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  DashboardPage,
  ProjectMarketplacePage,
  ProjectDetailsPage,
  CreateProjectPage,
  EditProjectPage,
  MyProjectsPage,
  FreelancersDirectoryPage,
  FreelancerProfilePage,
  ProfileSettingsPage,
  NotFoundPage,
} from './pages/index.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-slate-950">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/projects" element={<ProjectMarketplacePage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/freelancers" element={<FreelancersDirectoryPage />} />
                <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Client Project Management Routes */}
                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                      <CreateProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id/edit"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                      <EditProjectPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-projects"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']}>
                      <MyProjectsPage />
                    </ProtectedRoute>
                  }
                />

                {/* General Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
