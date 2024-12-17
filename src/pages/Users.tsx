import React from 'react';
import { ArrowLeft, Users as UsersIcon, Building2, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import { db } from '@/lib/firebase';
import { useCompanyStore } from '@/stores/companyStore';
import Button from '@/components/ui/Button';
import EditUserDialog from '@/components/users/EditUserDialog';
import type { User } from '@/types';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const { companies, initialize: initializeCompanies } = useCompanyStore();

  React.useEffect(() => {
    initializeCompanies();
  }, [initializeCompanies]);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as User[];
        
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin')}
          className="!p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Users
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
            <UsersIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No users found
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const userCompany = companies.find(c => c.id === user.companyId);
              
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
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
                        <UsersIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {userCompany && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {userCompany.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={cn(
                        "px-3 py-1 text-sm rounded-full",
                        user.role === 'staff' 
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                          : user.role === 'consultant'
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                      )}>
                        {user.role}
                      </span>
                      {user.subscriptionStatus && (
                        <span className={cn(
                          "px-3 py-1 text-xs rounded-full",
                          user.subscriptionStatus === 'active'
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : user.subscriptionStatus === 'past_due'
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            : ['canceled', 'unpaid'].includes(user.subscriptionStatus)
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                        )}>
                          {user.subscriptionStatus?.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedUser && (
        <EditUserDialog
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}