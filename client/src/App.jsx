import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.jsx';
import { LoginPage } from './pages/public/LoginPage.jsx';
import { RegisterPage } from './pages/public/RegisterPage.jsx';
import { ProjectMarketplacePage } from './pages/public/ProjectMarketplacePage.jsx';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage.jsx';
import { FreelancersDirectoryPage } from './pages/public/FreelancersDirectoryPage.jsx';
import { FreelancerProfilePage } from './pages/public/FreelancerProfilePage.jsx';

// Common Realtime Chat, Notifications, Settings, Contracts
import { MessagesPage } from './pages/common/MessagesPage.jsx';
import { NotificationsPage } from './pages/common/NotificationsPage.jsx';
import { SettingsPage } from './pages/common/SettingsPage.jsx';
import { ContractDetailsPage } from './pages/common/ContractDetailsPage.jsx';

// Client Portal Pages
import { ClientDashboardPage } from './pages/client/ClientDashboardPage.jsx';
import { ClientProjectsPage } from './pages/client/ClientProjectsPage.jsx';
import { CreateProjectPage } from './pages/client/CreateProjectPage.jsx';
import { ClientProjectProposalsPage } from './pages/client/ClientProjectProposalsPage.jsx';
import { ClientContractsPage } from './pages/client/ClientContractsPage.jsx';
import { ClientInvoicesPage } from './pages/client/ClientInvoicesPage.jsx';

// Freelancer Portal Pages
import { FreelancerDashboardPage } from './pages/freelancer/FreelancerDashboardPage.jsx';
import { FreelancerProposalsPage } from './pages/freelancer/FreelancerProposalsPage.jsx';
import { FreelancerContractsPage } from './pages/freelancer/FreelancerContractsPage.jsx';
import { FreelancerMilestonesPage } from './pages/freelancer/FreelancerMilestonesPage.jsx';
import { TimeTrackingPage } from './pages/freelancer/TimeTrackingPage.jsx';
import { EarningsPage } from './pages/freelancer/EarningsPage.jsx';
import { PortfolioPage } from './pages/freelancer/PortfolioPage.jsx';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';
import { AdminFreelancersPage } from './pages/admin/AdminFreelancersPage.jsx';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage.jsx';
import { AdminContractsPage } from './pages/admin/AdminContractsPage.jsx';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage.jsx';
import { AdminTaxonomyPage } from './pages/admin/AdminTaxonomyPage.jsx';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage.jsx';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.jsx';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/projects" element={<ProjectMarketplacePage />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/freelancers" element={<FreelancersDirectoryPage />} />
              <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
            </Route>

            {/* Client Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']} />}>
              <Route path="/client" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/client/dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboardPage />} />
                <Route path="projects" element={<ClientProjectsPage />} />
                <Route path="projects/create" element={<CreateProjectPage />} />
                <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
                <Route path="projects/:projectId/proposals" element={<ClientProjectProposalsPage />} />
                <Route path="contracts" element={<ClientContractsPage />} />
                <Route path="contracts/:id" element={<ContractDetailsPage />} />
                <Route path="invoices" element={<ClientInvoicesPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Freelancer Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['FREELANCER', 'ADMIN']} />}>
              <Route path="/freelancer" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
                <Route path="dashboard" element={<FreelancerDashboardPage />} />
                <Route path="projects" element={<ClientProjectsPage />} />
                <Route path="projects/create" element={<CreateProjectPage />} />
                <Route path="projects/:id" element={<ProjectDetailsPage />} />
                <Route path="proposals" element={<FreelancerProposalsPage />} />
                <Route path="contracts" element={<FreelancerContractsPage />} />
                <Route path="contracts/:id" element={<ContractDetailsPage />} />
                <Route path="milestones" element={<FreelancerMilestonesPage />} />
                <Route path="time-tracking" element={<TimeTrackingPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Admin Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="freelancers" element={<AdminFreelancersPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="contracts" element={<AdminContractsPage />} />
                <Route path="disputes" element={<AdminDisputesPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
                <Route path="categories" element={<AdminTaxonomyPage />} />
                <Route path="skills" element={<AdminTaxonomyPage />} />
                <Route path="taxonomy" element={<AdminTaxonomyPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);
}
