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
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-gray-300">
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
        className={`w-full rounded-lg border bg-[#1C1A17] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:ring-0 ${
          erreur
            ? 'border-red-500 focus:border-red-500'
            : 'border-[#2C261A] focus:border-[#D4AF37]/50 focus:bg-[#23201D]'
        }`}
      />
      {erreur && <p className="mt-1.5 text-xs text-red-500">{erreur}</p>}
    </div>
  );
}
