import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Lazy-loaded Pages for optimal code-splitting
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const CustomersPage = lazy(() => import('./pages/Customers/CustomersPage'));
const ChefsPage = lazy(() => import('./pages/Chefs/ChefsPage'));
const ChefApprovalsPage = lazy(() => import('./pages/Chefs/ChefApprovalsPage'));
const FoodsPage = lazy(() => import('./pages/Foods/FoodsPage'));
const CategoriesPage = lazy(() => import('./pages/Categories/CategoriesPage'));
const OrdersPage = lazy(() => import('./pages/Orders/OrdersPage'));
const SubscriptionsPage = lazy(() => import('./pages/Subscriptions/SubscriptionsPage'));
const FinancePage = lazy(() => import('./pages/Finance/FinancePage'));
const AdminEarningsPage = lazy(() => import('./pages/AdminEarnings/AdminEarningsPage'));
const BankAccountsPage = lazy(() => import('./pages/BankAccounts/BankAccountsPage'));
const WithdrawalsPage = lazy(() => import('./pages/Withdrawals/WithdrawalsPage'));
const ReviewsComplaintsPage = lazy(() => import('./pages/ReviewsComplaints/ReviewsComplaintsPage'));
const AnalyticsPage = lazy(() => import('./pages/Analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogs/AuditLogsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

const PageLoader = () => (
  <div className="flex h-96 items-center justify-center">
    <LoadingSpinner size="md" text="Loading view..." />
  </div>
);

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="chefs" element={<ChefsPage />} />
                <Route path="chef-approvals" element={<ChefApprovalsPage />} />
                <Route path="foods" element={<FoodsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="admin-earnings" element={<AdminEarningsPage />} />
                <Route path="bank-accounts" element={<BankAccountsPage />} />
                <Route path="withdrawals" element={<WithdrawalsPage />} />
                <Route path="reviews-complaints" element={<ReviewsComplaintsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
