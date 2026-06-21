import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ReferencesPage from './pages/ReferencesPage';
import ReferenceDetailPage from './pages/ReferenceDetailPage';
import ReferenceFormPage from './pages/ReferenceFormPage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/references"
        element={
          <ProtectedRoute>
            <ReferencesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/references/new"
        element={
          <ProtectedRoute>
            <ReferenceFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/references/:id"
        element={
          <ProtectedRoute>
            <ReferenceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/references/:id/edit"
        element={
          <ProtectedRoute>
            <ReferenceFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
