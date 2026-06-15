import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import Spinner from '../components/Spinner';
import { extraireErreurs } from '../utils/erreurs';

export default function DashboardPage() {
  const { utilisateur, logout, updateProfile } = useAuth();

  const [nom, setNom] = useState(utilisateur?.nom ?? '');
  const [email, setEmail] = useState(utilisateur?.email ?? '');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseConfirmation, setMotDePasseConfirmation] = useState('');
  const [champs, setChamps] = useState({});
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  async function enregistrer(evenement) {
    evenement.preventDefault();
    setEnCours(true);
    setChamps({});
    setMessageSucces('');
    setMessageErreur('');

    try {
      const reponse = await updateProfile({ nom, email, motDePasse, motDePasseConfirmation });
      setMessageSucces(reponse?.message ?? 'Profil mis à jour.');
      setMotDePasse('');
      setMotDePasseConfirmation('');
    } catch (error) {
      const { message, champs: erreursChamps } = extraireErreurs(error);
      setChamps(erreursChamps);
      if (Object.keys(erreursChamps).length === 0) setMessageErreur(message);
    } finally {
      setEnCours(false);
    }
  }

  async function seDeconnecter() {
    setDeconnexionEnCours(true);
    await logout();
    // La redirection vers /login est gérée automatiquement par ProtectedRoute.
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">Références bibliographiques</span>
          <button
            onClick={seDeconnecter}
            disabled={deconnexionEnCours}
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60"
          >
            {deconnexionEnCours && <Spinner className="h-4 w-4" />}
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Bonjour, {utilisateur?.nom}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connecté avec {utilisateur?.email} ·{' '}
            {utilisateur?.role === 'administrateur' ? 'Administrateur' : 'Utilisateur'}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">Mon profil</h2>
          <p className="mt-1 text-sm text-gray-500">
            Modifiez votre nom, votre adresse e-mail ou votre mot de passe.
          </p>

          {messageSucces && (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {messageSucces}
            </div>
          )}
          {messageErreur && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {messageErreur}
            </div>
          )}

          <form onSubmit={enregistrer} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
            <FormField
              id="nom"
              label="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              erreur={champs.nom}
              autoComplete="name"
            />
            <FormField
              id="email"
              label="Adresse e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erreur={champs.email}
              autoComplete="email"
            />
            <FormField
              id="mot_de_passe"
              label="Nouveau mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              erreur={champs.mot_de_passe}
              autoComplete="new-password"
              placeholder="Laisser vide pour conserver"
            />
            <FormField
              id="mot_de_passe_confirmation"
              label="Confirmer le mot de passe"
              type="password"
              value={motDePasseConfirmation}
              onChange={(e) => setMotDePasseConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />

            <div className="sm:col-span-2 mt-1">
              <button
                type="submit"
                disabled={enCours}
                className="flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enCours && <Spinner className="h-4 w-4" />}
                {enCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
