import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { extraireErreurs } from '../utils/erreurs';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [champs, setChamps] = useState({});
  const [messageGlobal, setMessageGlobal] = useState('');
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement) {
    evenement.preventDefault();
    setEnCours(true);
    setChamps({});
    setMessageGlobal('');

    try {
      await login(email, motDePasse);
      navigate('/bibliotheque', { replace: true });
    } catch (error) {
      const { message, champs: erreursChamps } = extraireErreurs(error);
      setChamps(erreursChamps);
      if (Object.keys(erreursChamps).length === 0) setMessageGlobal(message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <AuthLayout
      titre="Connexion"
      sousTitre="Connectez-vous pour accéder à vos références."
      pied={
        <div className="text-gray-400">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-bold text-[#D4AF37] hover:text-white transition-colors underline-offset-4 hover:underline">
            Créer un compte
          </Link>
        </div>
      }
    >
      <form onSubmit={soumettre} className="space-y-4" noValidate>
        {messageGlobal && (
          <div className="rounded-md border border-red-500/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {messageGlobal}
          </div>
        )}

        <FormField
          id="email"
          label="Adresse e-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          erreur={champs.email}
          autoComplete="email"
          placeholder="vous@exemple.com"
          required
        />

        <FormField
          id="mot_de_passe"
          label="Mot de passe"
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          erreur={champs.mot_de_passe}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        {/* Séparateur OAuth */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2C261A]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#14120E] px-2 text-gray-500">ou</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const baseUrl = API_URL.replace(/\/api\/?$/, '');
            window.location.href = `${baseUrl}/api/auth/google/redirect`;
          }}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#2C261A] bg-[#1C1A17] px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-[#23201D] hover:text-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Se connecter avec Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2C261A]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#14120E] px-2 text-gray-500">ou avec email</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={enCours}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-white shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours && <Spinner className="h-4 w-4" />}
          {enCours ? 'Accès en cours…' : 'Accéder à la Bibliothèque'}
        </button>
      </form>
    </AuthLayout>
  );
}
