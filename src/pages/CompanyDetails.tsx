import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, Globe, Users, MapPin, Tag, Pencil, Trash2 } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import EditCompanyDialog from '@/components/companies/EditCompanyDialog';
import DeleteDialog from '@/components/ui/DeleteDialog';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, updateCompany, deleteCompany } = useCompanyStore();
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const company = companies.find(c => c.id === id);

  React.useEffect(() => {
    async function fetchCompanyUsers() {
      if (!id) return;
      
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), where('companyId', '==', id));
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
  }, [id]);

  const handleEditSubmit = async (data: any) => {
    if (!id) return;
    await updateCompany(id, data);
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteCompany(id);
      navigate('/companies');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/companies')}
          className="!p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {company.name}
        </h1>
        {currentUser?.role === 'staff' && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditDialogOpen(true)}
              className="!p-2"
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="!p-2 hover:!bg-red-100 hover:!text-red-600 dark:hover:!bg-red-900/20 dark:hover:!text-red-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[350px,1fr]">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Company Information
            </h2>
            <div className="space-y-4">
              {company.address && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span>{company.address}</span>
                </div>
              )}
              {company.location && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{company.location}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
            
            {company.serviceTypes && company.serviceTypes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Service Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.serviceTypes.map(service => (
                    <span
                      key={service}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {company.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {company.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Company Users
            </h2>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">
                {users.length} users
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
                No users found for this company
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
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
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
      </div>
      
      {currentUser?.role === 'staff' && (
        <>
          <EditCompanyDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleEditSubmit}
            company={company}
          />
          
          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            isLoading={isDeleting}
            title="Delete Company"
            description={`Are you sure you want to delete ${company.name}? This action cannot be undone.`}
          />
        </>
      )}
    </div>
  );
}