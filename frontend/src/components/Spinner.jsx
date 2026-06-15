/** Indicateur de chargement circulaire. */
export default function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Chargement en cours"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

/** Écran de chargement plein écran (vérification du token au démarrage). */
export function EcranChargement() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-400">
      <Spinner className="h-7 w-7" />
    </div>
  );
}
