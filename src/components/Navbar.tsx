import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils/cn';
import UserInfoDialog from '@/components/user/UserInfoDialog';
import { translations } from '@/utils/translations';
import { Clock, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].common;
  const navigate = useNavigate();
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to={`/${user?.role}`} className="flex-shrink-0 flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                {t.appName}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUserDialogOpen(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {user && (
          <UserInfoDialog
            isOpen={isUserDialogOpen}
            onClose={() => setIsUserDialogOpen(false)}
            user={user}
          />
        )}
      </div>
    </nav>
  );
}