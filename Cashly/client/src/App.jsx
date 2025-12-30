import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useContext } from 'react';
import { Loader2 } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import UploadDataPage from './pages/UploadDataPage';
import AIAnalysisPage from './pages/AIAnalysisPage'; // Using the full dashboard version
import SettingsPage from './pages/SettingsPage';
import ReceivablesPage from './pages/ReceivablesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessSetup from './pages/BusinessSetup';


import RealTimeAnalyticsPage from './pages/RealTimeAnalyticsPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import AreaChartPage from './pages/AreaChartPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthContext from './contexts/AuthContext';

import AppLock from './components/AppLock';

const LoadingScreen = () => (
  <div className="h-screen w-full bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Cashly...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route that requires business selection
const BusinessRoute = ({ children }) => {
  const { user, loading, selectedBusiness, businesses } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has no businesses, redirect to setup
  if (!loading && (!businesses || businesses.length === 0)) {
    return <Navigate to="/setup" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Business Setup - protected but doesn't require business */}
          <Route path="/setup" element={
            <ProtectedRoute>
              <BusinessSetup />
            </ProtectedRoute>
          } />

          {/* All other routes require business selection */}
          <Route path="/dashboard" element={
            <BusinessRoute>
              <Dashboard />
            </BusinessRoute>
          } />
          <Route path="/income" element={
            <BusinessRoute>
              <IncomePage />
            </BusinessRoute>
          } />
          <Route path="/expenses" element={
            <BusinessRoute>
              <ExpensesPage />
            </BusinessRoute>
          } />
          <Route path="/upload" element={
            <BusinessRoute>
              <UploadDataPage />
            </BusinessRoute>
          } />
          <Route path="/ai-analysis" element={
            <BusinessRoute>
              <AIAnalysisPage />
            </BusinessRoute>
          } />
          <Route path="/settings" element={
            <BusinessRoute>
              <SettingsPage />
            </BusinessRoute>
          } />
          <Route path="/receivables" element={
            <BusinessRoute>
              <ReceivablesPage />
            </BusinessRoute>
          } />
          <Route path="/forecast" element={
            <BusinessRoute>
              <Dashboard />
            </BusinessRoute>
          } />
          <Route path="/realtime" element={
            <BusinessRoute>
              <RealTimeAnalyticsPage />
            </BusinessRoute>
          } />
          <Route path="/analytics-dashboard" element={
            <BusinessRoute>
              <AnalyticsDashboardPage />
            </BusinessRoute>
          } />

          <Route path="/growth-analytics" element={
            <BusinessRoute>
              <AreaChartPage />
            </BusinessRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
