/**
 * Normalise une erreur Axios renvoyée par l'API Laravel en :
 *  - message : message global (clé « message » de la réponse) ;
 *  - champs  : erreurs de validation par champ (clé « errors »).
 */
export function extraireErreurs(error) {
  const data = error?.response?.data;
  const champs = {};

  if (data?.errors && typeof data.errors === 'object') {
    for (const [cle, valeurs] of Object.entries(data.errors)) {
      champs[cle] = Array.isArray(valeurs) ? valeurs[0] : String(valeurs);
    }
  }

  return {
    message: data?.message ?? 'Une erreur est survenue. Veuillez réessayer.',
    champs,
  };
}
