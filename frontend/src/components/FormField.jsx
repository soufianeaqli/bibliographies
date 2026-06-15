/** Champ de formulaire réutilisable : label + input + message d'erreur. */
export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  erreur,
  autoComplete,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
          erreur
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-gray-400 focus:ring-gray-100'
        }`}
      />
      {erreur && <p className="mt-1.5 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
