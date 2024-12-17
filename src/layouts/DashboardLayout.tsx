import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Navbar from '@/components/Navbar';
import MainNav from '@/components/navigation/MainNav'; 

export default function DashboardLayout() {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <MainNav />
      <main className="py-10 transition-all duration-300 md:ml-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}