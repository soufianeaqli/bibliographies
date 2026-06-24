import React from 'react';
import ThreeDLibrary from '../components/ThreeDLibrary';
import { useAuth } from '../context/AuthContext';
import AdminBookList from '../components/AdminBookList';
import UserLibrary from '../components/UserLibrary';

export default function LibraryDashboard() {
  const { utilisateur } = useAuth();

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
           <AdminBookList />
        ) : (
           <UserLibrary />
        )}
      </div>

    </div>
  );
}
