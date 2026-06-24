import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import LibraryLayout from './components/LibraryLayout';
import LibraryDashboard from './pages/LibraryDashboard';
import BookReaderPage from './pages/BookReaderPage';
import BookDetailPage from './pages/BookDetailPage';
import MesLivres from './pages/MesLivres';
import GestionReservations from './pages/GestionReservations';
import { Accueil, Categories, Favoris, Historiques, Notes, Recommandations, Profil } from './pages/LibrarySubPages';
import ContactPage from './pages/ContactPage';
import AdminMessagerie from './components/AdminMessagerie';
import AdminUsers from './components/AdminUsers';

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
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      <Route path="/bibliotheque" element={<ProtectedRoute><LibraryLayout /></ProtectedRoute>}>
        <Route index element={<Accueil />} />
        <Route path="livres" element={<LibraryDashboard />} />
        <Route path="mes-livres" element={<MesLivres />} />
        <Route path="reservations" element={<GestionReservations />} />
        <Route path="categories" element={<Categories />} />
        <Route path="favoris" element={<Favoris />} />
        <Route path="historique" element={<Historiques />} />
        <Route path="notes" element={<Notes />} />
        <Route path="recommandations" element={<Recommandations />} />
        <Route path="profil" element={<Profil />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="messagerie" element={<AdminMessagerie />} />
        <Route path="utilisateurs" element={<AdminUsers />} />
      </Route>

      {/* Book detail */}
      <Route path="/book/:id" element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />

      {/* Reader 3D (Plein ecran) */}
      <Route path="/reader" element={<ProtectedRoute><BookReaderPage /></ProtectedRoute>} />
      <Route path="/reader/:id" element={<ProtectedRoute><BookReaderPage /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to="/bibliotheque" replace />} />
      <Route path="*" element={<Navigate to="/bibliotheque" replace />} />
    </Routes>
  );
}
