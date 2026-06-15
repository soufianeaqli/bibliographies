import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EcranChargement } from './Spinner';

/** Réservé aux visiteurs : redirige vers /dashboard si déjà connecté. */
export default function PublicOnlyRoute({ children }) {
  const { estAuthentifie, chargement } = useAuth();

  if (chargement) return <EcranChargement />;
  if (estAuthentifie) return <Navigate to="/dashboard" replace />;
  return children;
}
