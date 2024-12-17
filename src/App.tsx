import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { lazy, Suspense, useEffect } from 'react';
import NotFound from '@/pages/NotFound';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { RouteProvider } from '@/providers/RouteProvider'; 

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Overview = lazy(() => import('@/pages/Overview'));
const Admin = lazy(() => import('@/pages/Admin'));
const Companies = lazy(() => import('@/pages/Companies'));
const CompanyDetails = lazy(() => import('@/pages/CompanyDetails'));
const Users = lazy(() => import('@/pages/Users'));
const Home = lazy(() => import('@/pages/Home'));
const Balances = lazy(() => import('@/pages/Balances'));
const Time = lazy(() => import('@/pages/Time'));
const Features = lazy(() => import('@/pages/Features'));
const Settings = lazy(() => import('@/pages/Settings'));


const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin text-blue-600" />
  </div>
);

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { validateRoute } = useRouteGuard();

  useEffect(() => {
    if (!loading && initialized) {
      const isPublicRoute = ['/login', '/register'].includes(location.pathname);
      
      if (!user && !isPublicRoute) {
        navigate('/login', { replace: true, state: { from: location } });
      } else if (user && isPublicRoute) {
        navigate(`/${user.role}`, { replace: true });
      } else if (user && !validateRoute(location.pathname, user.role)) {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, loading, initialized, location, navigate, validateRoute]);

  if (loading || !initialized) {
    return <LoadingFallback />;
  }

  return <>{children}</>;
}
function App() {
  const { loading, initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RouteProvider>
        <RouteGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>
              <Route element={<DashboardLayout />}>
                <Route path="/customer" element={<Overview />} />
                <Route path="/staff" element={<Overview />} />
                <Route path="/consultant" element={<Overview />} />
                <Route path="/home" element={<Home />} />
                <Route path="/balances" element={<Balances />} />
                <Route path="/time" element={<Time />} />
                <Route path="/features/*" element={<Features />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetails />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </RouteGuard>
      </RouteProvider>
    </BrowserRouter>
  );
}

export default App;