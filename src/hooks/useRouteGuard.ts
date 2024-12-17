import { useCallback } from 'react';

const ROUTE_PERMISSIONS = {
  customer: ['/customer', '/home', '/time', '/settings', '/features'],
  consultant: ['/consultant', '/home', '/time', '/settings', '/features'],
  staff: ['/staff', '/customer', '/consultant', '/home', '/balances', '/time', '/settings', '/features', '/admin', '/companies', '/users'],
} as const;

export function useRouteGuard() {
  const validateRoute = useCallback((path: string, role?: string) => {
    if (!role) return false;
    
    const allowedPaths = ROUTE_PERMISSIONS[role as keyof typeof ROUTE_PERMISSIONS] || [];
    
    // Handle dashboard routes based on role
    if (path === '/customer' && role === 'customer') return true;
    if (path === '/staff' && role === 'staff') return true;
    if (path === '/consultant' && role === 'consultant') return true;
    
    // Staff can access all dashboards
    if (role === 'staff' && ['/customer', '/staff', '/consultant'].includes(path)) {
      return true;
    }
    
    // Check other routes
    return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
  }, []);

  return { validateRoute };
}