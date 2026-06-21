import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { extraireErreurs } from '../utils/erreurs';

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
