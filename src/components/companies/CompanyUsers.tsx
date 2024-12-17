import React from 'react';
import { Users, Mail } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';

interface CompanyUsersProps {
  companyId: string;
}

export default function CompanyUsers({ companyId }: CompanyUsersProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { language } = useLanguage();
  const t = translations[language].company;

  React.useEffect(() => {
    async function fetchCompanyUsers() {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), where('companyId', '==', companyId));
        const snapshot = await getDocs(q);
        const companyUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as User[];
        
        setUsers(companyUsers);
      } catch (error) {
        console.error('Error fetching company users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyUsers();
  }, [companyId]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t.users}
        </h2>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">
            {users.length} {t.totalUsers}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg h-16 animate-pulse"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t.noUsers}
          </p>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[300px]"
            >
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}