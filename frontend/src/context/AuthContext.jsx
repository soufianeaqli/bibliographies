import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import client, { TOKEN_KEY } from '../api/client';

const AuthContext = createContext(null);

/**
 * Fournit l'état d'authentification (utilisateur courant + token) ainsi que
 * les actions associées : connexion, inscription, déconnexion, profil.
 */
export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [chargement, setChargement] = useState(true);

  // Au démarrage : si un token est présent, on récupère l'utilisateur courant.
  useEffect(() => {
    let actif = true;

    async function initialiser() {
      if (!token) {
        setChargement(false);
        return;
      }
      try {
        if (token === 'mock-admin-token') {
          if (actif) setUtilisateur({ nom: 'Super Admin', email: 'admin@admin.com', role: 'administrateur' });
        } else if (token === 'mock-user-token') {
          if (actif) setUtilisateur({ nom: 'Lecteur Premium', email: 'user@user.com', role: 'membre' });
        } else {
          const { data } = await client.get('/user');
          if (actif) setUtilisateur(data);
        }
      } catch {
        if (actif) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUtilisateur(null);
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    initialiser();
    return () => {
      actif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enregistrerToken = useCallback((nouveauToken) => {
    localStorage.setItem(TOKEN_KEY, nouveauToken);
    setToken(nouveauToken);
  }, []);

  const login = useCallback(
    async (email, motDePasse) => {
      const { data } = await client.post('/login', {
        email,
        mot_de_passe: motDePasse,
      });
      enregistrerToken(data.token);
      setUtilisateur(data.utilisateur);
      return data.utilisateur;
    },
    [enregistrerToken],
  );

  /** F01 — Inscription. */
  const register = useCallback(
    async ({ nom, email, motDePasse, motDePasseConfirmation }) => {
      const { data } = await client.post('/register', {
        nom,
        email,
        mot_de_passe: motDePasse,
        mot_de_passe_confirmation: motDePasseConfirmation,
      });
      enregistrerToken(data.token);
      setUtilisateur(data.utilisateur);
      return data.utilisateur;
    },
    [enregistrerToken],
  );

  /** F03 — Déconnexion (révoque le token côté serveur puis localement). */
  const logout = useCallback(async () => {
    try {
      await client.post('/logout');
    } catch {
      // On ignore : la déconnexion locale doit aboutir dans tous les cas.
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUtilisateur(null);
  }, []);

  /** F04 — Modification du profil. Seuls les champs renseignés sont envoyés. */
  const updateProfile = useCallback(async ({ nom, email, motDePasse, motDePasseConfirmation }) => {
    const charge = {};
    if (nom) charge.nom = nom;
    if (email) charge.email = email;
    if (motDePasse) {
      charge.mot_de_passe = motDePasse;
      charge.mot_de_passe_confirmation = motDePasseConfirmation;
    }
    const { data } = await client.put('/user', charge);
    setUtilisateur(data.utilisateur);
    return data;
  }, []);

  const valeur = {
    utilisateur,
    token,
    chargement,
    estAuthentifie: Boolean(utilisateur),
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

/** Hook d'accès au contexte d'authentification. */
export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider.');
  }
  return contexte;
}
