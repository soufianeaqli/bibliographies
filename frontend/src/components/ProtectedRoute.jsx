import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EcranChargement } from './Spinner';

/** Protège une route : redirige vers /login si l'utilisateur n'est pas connecté. */
export default function ProtectedRoute({ children }) {
  const { estAuthentifie, chargement } = useAuth();

  if (chargement) return <EcranChargement />;
  if (!estAuthentifie) return <Navigate to="/login" replace />;
  return children;
}
