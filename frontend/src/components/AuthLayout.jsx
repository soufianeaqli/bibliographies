import React from 'react';
import { Library } from 'lucide-react';
import libraryBg from '../assets/library_bg.png';

export default function AuthLayout({ titre, sousTitre, children, pied }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0E0C0A] overflow-hidden">
      {/* Background with 3D Library Vibe */}
      <div className="absolute inset-0 z-0">
         <img src={libraryBg} alt="Library" className="w-full h-full object-cover opacity-30 mix-blend-lighten" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-[#0E0C0A]/80 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="p-4 bg-[#D4AF37]/10 rounded-full mb-4 ring-1 ring-[#D4AF37]/30 shadow-[0_0_20px_#D4AF3733]">
             <Library className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Smart Library 3D</h1>
          <p className="mt-2 text-sm text-[#D4AF37]/70 uppercase tracking-widest font-semibold">Portail d'Accès</p>
        </div>

        <div className="rounded-2xl border border-[#2C261A] bg-[#14120E]/80 backdrop-blur-xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle gold glow at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          
          <h2 className="text-xl font-bold text-white">{titre}</h2>
          {sousTitre && <p className="mt-2 text-sm text-gray-400">{sousTitre}</p>}
          
          <div className="mt-8">{children}</div>
        </div>

        {pied && (
          <div className="mt-8 text-center text-sm text-gray-400">
            {pied}
          </div>
        )}
      </div>
    </div>
  );
}
