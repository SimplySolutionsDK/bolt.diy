import React, { createContext, useContext, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RouteContextType {
  previousRoute: string | null;
  setPreviousRoute: (route: string) => void;
  navigateWithTransition: (to: string) => void;
}

const RouteContext = createContext<RouteContextType | null>(null);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigateWithTransition = useCallback((to: string) => {
    setPreviousRoute(location.pathname);
    navigate(to);
  }, [location.pathname, navigate]);

  return (
    <RouteContext.Provider 
      value={{ 
        previousRoute, 
        setPreviousRoute, 
        navigateWithTransition 
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  return context;
}