import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY } from '../api/client';
import AuthLayout from '../components/AuthLayout';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { estAuthentifie } = useAuth();
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (estAuthentifie) {
      navigate('/bibliotheque', { replace: true });
      return;
    }

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setErreur(error);
      return;
    }

    if (token) {
      const stocke = localStorage.getItem(TOKEN_KEY);
      if (stocke === token) {
        return; // déjà stocké, AuthContext va récupérer l'utilisateur
      }
      localStorage.setItem(TOKEN_KEY, token);
      window.location.reload();
    }
  }, [searchParams, navigate, estAuthentifie]);

  if (erreur) {
    return (
      <AuthLayout titre="Échec de la connexion" sousTitre={erreur}>
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-white"
          >
            Retour à la connexion
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout titre="Connexion en cours…" sousTitre="Veuillez patienter">
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    </AuthLayout>
  );
}
