import React, { useState } from 'react';
import { X, Upload, FileText, Film, Headphones, Image as ImageIcon } from 'lucide-react';
import { createBook } from '../api/libraryClient';

export default function AdminMediaUpload({ onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    title: '', author: '', description: '', video_url: ''
  });
  const [files, setFiles] = useState({
    cover_image: null, pdf_file: null, audio_file: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.author) {
        setError("Le titre et l'auteur sont obligatoires.");
        return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('video_url', formData.video_url);

    if (files.cover_image) data.append('cover_image', files.cover_image);
    if (files.pdf_file) data.append('pdf_file', files.pdf_file);
    if (files.audio_file) data.append('audio_file', files.audio_file);

    try {
        await createBook(data);
        if (onUploadSuccess) onUploadSuccess();
        onClose();
    } catch (err) {
        setError("Erreur lors de l'upload: " + (err.response?.data?.message || err.message));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#14120E] border border-[#D4AF37]/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#2C261A] bg-[#0E0C0A]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#D4AF37]"/> Ajouter une Nouvelle Œuvre
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="uploadForm" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 rounded">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Titre du livre *</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full bg-[#1C1A17] border border-[#2C261A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]/50" placeholder="Ex: Dune" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Auteur *</label>
                    <input required name="author" value={formData.author} onChange={handleInputChange} type="text" className="w-full bg-[#1C1A17] border border-[#2C261A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]/50" placeholder="Ex: Frank Herbert" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description courte</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-[#1C1A17] border border-[#2C261A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]/50" placeholder="Résumé captivant..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">URL Vidéo Promo (Optionnel)</label>
                    <input name="video_url" value={formData.video_url} onChange={handleInputChange} type="url" className="w-full bg-[#1C1A17] border border-[#2C261A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]/50" placeholder="https://youtube.com/..." />
                  </div>
               </div>

               {/* Right side : Media Uploads */}
               <div className="space-y-4">
                 <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Fichiers Médias</h3>
                 
                 <label className={`flex items-center gap-3 p-3 rounded-lg border border-dashed transition-colors cursor-pointer ${files.cover_image ? 'border-green-500/50 bg-green-500/5' : 'border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1A17]'}`}>
                    <div className="p-2 bg-black/40 rounded text-blue-400"><ImageIcon className="w-5 h-5"/></div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-gray-200">Image de Couverture</p>
                       <p className="text-xs text-gray-500">{files.cover_image ? files.cover_image.name : 'JPG, PNG (max 5MB)'}</p>
                    </div>
                    <input type="file" name="cover_image" accept="image/*" onChange={handleFileChange} className="hidden" />
                 </label>

                 <label className={`flex items-center gap-3 p-3 rounded-lg border border-dashed transition-colors cursor-pointer ${files.pdf_file ? 'border-green-500/50 bg-green-500/5' : 'border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1A17]'}`}>
                    <div className="p-2 bg-black/40 rounded text-red-400"><FileText className="w-5 h-5"/></div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-gray-200">Fichier de Lecture</p>
                       <p className="text-xs text-gray-500">{files.pdf_file ? files.pdf_file.name : 'PDF (max 50MB)'}</p>
                    </div>
                    <input type="file" name="pdf_file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                 </label>

                 <label className={`flex items-center gap-3 p-3 rounded-lg border border-dashed transition-colors cursor-pointer ${files.audio_file ? 'border-green-500/50 bg-green-500/5' : 'border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1A17]'}`}>
                    <div className="p-2 bg-black/40 rounded text-green-400"><Headphones className="w-5 h-5"/></div>
                    <div className="flex-1">
                       <p className="text-sm font-bold text-gray-200">Livre Audio</p>
                       <p className="text-xs text-gray-500">{files.audio_file ? files.audio_file.name : 'MP3 (max 100MB)'}</p>
                    </div>
                    <input type="file" name="audio_file" accept="audio/mp3,audio/wav" onChange={handleFileChange} className="hidden" />
                 </label>

               </div>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2C261A] bg-[#0E0C0A] flex justify-end gap-4">
           <button onClick={onClose} type="button" disabled={isLoading} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-400 transition-colors hover:text-white disabled:opacity-50">
             Annuler
           </button>
           <button form="uploadForm" type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg text-sm font-bold bg-[#D4AF37] text-black hover:bg-white transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50 flex items-center gap-2">
             {isLoading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span> : null}
             Importer l'Œuvre
           </button>
        </div>

      </div>
    </div>
  );
}
