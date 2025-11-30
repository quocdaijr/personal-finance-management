// React import removed - not needed with modern JSX transform
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/AppLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionsEnhanced from './pages/TransactionsEnhanced';
import Accounts from './pages/Accounts';
import Budgets from './pages/Budgets';
import Wallets from './pages/Wallets';
import Goals from './pages/Goals';
import RecurringTransactions from './pages/RecurringTransactions';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import GeneralSettings from './pages/GeneralSettings';
import AccountSettings from './pages/AccountSettings';
import Help from './pages/Help';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionsEnhanced />} />
                <Route path="/transactions-old" element={<Transactions />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/wallets" element={<Wallets />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/recurring" element={<RecurringTransactions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings/general" element={<GeneralSettings />} />
                <Route path="/settings/account" element={<AccountSettings />} />
                <Route path="/help" element={<Help />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </UserPreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
