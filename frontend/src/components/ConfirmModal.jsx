import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Supprimer définitivement', cancelText = 'Annuler' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      ></div>
      
      <div className={`relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ease-out border border-gray-100 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
        <div className="p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-extrabold mb-3 text-gray-900 text-center tracking-tight">{title}</h2>
          <p className="text-gray-500 text-center leading-relaxed font-medium text-sm px-2">{message}</p>
        </div>
        
        <div className="p-6 bg-gray-50 flex flex-col-reverse sm:flex-row justify-center gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 font-semibold rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-6 py-3 font-bold rounded-xl text-white bg-red-600 border border-transparent hover:bg-red-700 transition-all shadow-md hover:shadow-red-500/30"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
