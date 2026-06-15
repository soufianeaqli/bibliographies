/** Habillage commun des pages d'authentification (connexion / inscription). */
export default function AuthLayout({ titre, sousTitre, children, pied }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-base font-semibold text-gray-900">Références bibliographiques</h1>
          <p className="text-sm text-gray-500">Projet PT16</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">{titre}</h2>
          {sousTitre && <p className="mt-1 text-sm text-gray-500">{sousTitre}</p>}
          <div className="mt-5">{children}</div>
        </div>

        {pied && <p className="mt-5 text-sm text-gray-600">{pied}</p>}
      </div>
    </div>
  );
}
