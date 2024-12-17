import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLanguage } from '@/hooks/useLanguage';
import { useRoute } from '@/providers/RouteProvider';
import { 
  Home,
  CreditCard,
  Clock,
  Shield,
  Settings,
  Lightbulb,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { translations } from '@/utils/translations';

const getNavItems = (role: string, t: any) => [
  {
    label: t.nav.dashboard,
    icon: LayoutDashboard,
    path: `/${role}`,
    color: 'text-indigo-500',
    roles: ['customer', 'staff', 'consultant'],
  },
  {
    label: t.nav.home,
    icon: Home,
    path: '/home',
    color: 'text-blue-500',
    roles: [],
  },
  {
    label: t.nav.balances,
    icon: CreditCard,
    path: '/balances',
    color: 'text-purple-500',
    roles: ['staff'],
  },
  {
    label: t.nav.time,
    icon: Clock,
    path: '/time',
    color: 'text-green-500',
    roles: ['customer', 'staff', 'consultant'],
  },
  {
    label: t.nav.features,
    icon: Lightbulb,
    path: '/features',
    color: 'text-yellow-500',
    roles: ['customer', 'staff', 'consultant'],
  },
  {
    label: t.nav.settings,
    icon: Settings,
    path: '/settings',
    color: 'text-orange-500',
    roles: ['customer', 'staff', 'consultant'],
  },
    {
    label: 'Admin',
    icon: Shield,
    path: '/admin',
    color: 'text-red-500',
    roles: ['staff'],
  },
];

export default function MainNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { navigateWithTransition } = useRoute();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language];

  const navItems = React.useMemo(() => 
    getNavItems(user?.role || 'customer', t).filter(item => 
      item.roles.includes(user?.role || 'customer')
    ), [user?.role, t]);

  const toggleNav = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Navigation Container */}
      <nav
        className={cn(
          'fixed z-40 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg',
          isMobile
            ? 'inset-x-0 bottom-0 p-4 pb-safe'
            : 'top-0 left-0 h-screen w-16 hover:w-48 group p-3 overflow-y-auto',
          'border-t md:border-r border-gray-200 dark:border-gray-800',
        )}
      >
        <motion.div
          className={cn(
            'flex h-full',
            isMobile ? 'justify-around' : 'flex-col gap-2'
          )} 
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigateWithTransition(item.path);
              }}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) => cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                'hover:bg-gray-100/60 dark:hover:bg-gray-800/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                isActive && 'bg-gray-100/40 dark:bg-gray-800/40',
                isMobile ? 'flex-col text-xs' : 'flex-row text-sm'
              )}
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn('relative', isActive && item.color)}
                  >
                    <item.icon className="w-6 h-6" />
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={cn(
                          "absolute -inset-1 rounded-lg",
                          "bg-gradient-to-r from-current/20 to-current/5",
                          "border-l-2 border-current"
                        )}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                  <span className={cn(
                    'transition-opacity whitespace-nowrap',
                    isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    isActive && 'font-medium text-current'
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </motion.div>
      </nav>
    </>
  );
}