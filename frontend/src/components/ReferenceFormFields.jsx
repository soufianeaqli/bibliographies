import React from 'react';

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required = false }) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-gray-800 placeholder-gray-400"
    />
  </div>
);

export default function ReferenceFormFields({ type, data, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const wrapFields = (fields) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      {fields}
    </div>
  );

  switch (type) {
    case 'article':
      return wrapFields(<>
        <InputField label="Nom de la revue" name="details.revue" value={data.revue} onChange={handleChange} />
        <InputField label="Volume" name="details.volume" value={data.volume} onChange={handleChange} />
        <InputField label="Numéro" name="details.numero" value={data.numero} onChange={handleChange} />
        <InputField label="Pages" name="details.pages" value={data.pages} onChange={handleChange} />
        <InputField label="DOI (Digital Object Identifier)" name="details.doi" value={data.doi} onChange={handleChange} />
      </>);
    case 'livre':
      return wrapFields(<>
        <InputField label="Maison d'édition" name="details.editeur" value={data.editeur} onChange={handleChange} />
        <InputField label="Édition" name="details.edition" value={data.edition} onChange={handleChange} />
        <InputField label="Numéro ISBN" name="details.isbn" value={data.isbn} onChange={handleChange} />
      </>);
    case 'these':
      return wrapFields(<>
        <InputField label="Université / Établissement" name="details.universite" value={data.universite} onChange={handleChange} />
        <InputField label="Niveau (ex: Doctorat, Master)" name="details.niveau" value={data.niveau} onChange={handleChange} />
      </>);
    case 'site_web':
      return wrapFields(<>
        <InputField label="Adresse URL" name="details.url" value={data.url} onChange={handleChange} type="url" placeholder="https://" />
        <InputField label="Date de consultation" name="details.date_consultation" value={data.date_consultation} onChange={handleChange} type="date" />
      </>);
    case 'rapport':
      return wrapFields(<>
        <InputField label="Institution" name="details.institution" value={data.institution} onChange={handleChange} />
        <InputField label="Numéro de rapport" name="details.numero_rapport" value={data.numero_rapport} onChange={handleChange} />
      </>);
    case 'acte_conference':
      return wrapFields(<>
        <InputField label="Nom de la Conférence" name="details.conference" value={data.conference} onChange={handleChange} />
        <InputField label="Lieu" name="details.lieu" value={data.lieu} onChange={handleChange} />
        <InputField label="Pages" name="details.pages" value={data.pages} onChange={handleChange} />
      </>);
    default:
      return null;
  }
}
