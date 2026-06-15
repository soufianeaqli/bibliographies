import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { extraireErreurs } from '../utils/erreurs';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseConfirmation, setMotDePasseConfirmation] = useState('');
  const [champs, setChamps] = useState({});
  const [messageGlobal, setMessageGlobal] = useState('');
  const [enCours, setEnCours] = useState(false);

  async function soumettre(evenement) {
    evenement.preventDefault();
    setEnCours(true);
    setChamps({});
    setMessageGlobal('');

    try {
      await register({ nom, email, motDePasse, motDePasseConfirmation });
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
      titre="Créer un compte"
      sousTitre="Renseignez vos informations pour commencer."
      pied={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600">
            Se connecter
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
          id="nom"
          label="Nom complet"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          erreur={champs.nom}
          autoComplete="name"
          placeholder="Jean Dupont"
          required
        />

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
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          required
        />

        <FormField
          id="mot_de_passe_confirmation"
          label="Confirmer le mot de passe"
          type="password"
          value={motDePasseConfirmation}
          onChange={(e) => setMotDePasseConfirmation(e.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={enCours}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours && <Spinner className="h-4 w-4" />}
          {enCours ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </AuthLayout>
  );
}
