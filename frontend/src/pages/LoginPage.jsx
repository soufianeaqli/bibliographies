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
      navigate('/dashboard', { replace: true });
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
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={soumettre} className="space-y-4" noValidate>
        {messageGlobal && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours && <Spinner className="h-4 w-4" />}
          {enCours ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </AuthLayout>
  );
}
