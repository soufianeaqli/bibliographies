import React from 'react';
import ThreeDLibrary from '../components/ThreeDLibrary';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import UserLibrary from '../components/UserLibrary';

export default function LibraryDashboard() {
  const { utilisateur } = useAuth();
  
  // Fake data passed to User Library
  const recommendations = [
    { id: 1, title: 'Sapiens', author: 'Yuval Noah Harari', rating: 4.8, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop' },
    { id: 2, title: '1984', author: 'George Orwell', rating: 4.6, cover: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=300&auto=format&fit=crop' },
    { id: 3, title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', rating: 4.9, cover: 'https://images.unsplash.com/photo-1629196914275-f86050b4a4d6?q=80&w=300&auto=format&fit=crop' },
    { id: 4, title: 'L\'Alchimiste', author: 'Paulo Coelho', rating: 4.7, cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop' },
    { id: 5, title: 'La Peste', author: 'Albert Camus', rating: 4.5, cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0C0A] relative overflow-hidden">
      {/* Background 3D effects */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-lighten blur-[2px]">
          <ThreeDLibrary />
      </div>
      <div className="absolute inset-0 bg-[#0E0C0A]/70 z-0 pointer-events-none"></div>

      {/* Dynamic Content Rendering Based on Role */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        {utilisateur?.role === 'administrateur' ? (
           <AdminDashboard />
        ) : (
           <UserLibrary recommendations={recommendations} />
        )}
      </div>

    </div>
  );
}
