import React from 'react';
import { User, Mail, Calendar, Shield, Lock, Pencil, Check, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { z } from 'zod';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '@/lib/firebase';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { cn } from '@/utils/cn';
import { useCompanyStore } from '@/stores/companyStore';
import type { User as UserType } from '@/types';

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  companyId: z.string().optional(),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UserUpdateForm = z.infer<typeof userUpdateSchema>;
type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;

interface UserInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export default function UserInfoDialog({ isOpen, onClose, user }: UserInfoDialogProps) {
  const { language } = useLanguage();
  const t = translations[language].user;
  const { companies, initialize: initializeCompanies } = useCompanyStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  React.useEffect(() => {
    if (user?.role === 'staff' || user?.role === 'consultant') {
      initializeCompanies();
    }
  }, [user, initializeCompanies]);

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UserUpdateForm>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      companyId: user.companyId,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isUpdatingPassword },
    reset: resetPassword,
  } = useForm<PasswordUpdateForm>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      // If user had a previous photo, delete it
      if (user.photoURL) {
        try {
          const photoRef = ref(storage, `profile-pictures/${user.id}`);
          await deleteObject(photoRef);
          await updateDoc(doc(db, 'users', user.id), {
            photoURL: null
          });
        } catch (err) {
          console.error('Error deleting profile picture:', err);
        }
      }
      return;
    }

    try {
      setUploadingImage(true);
      const photoRef = ref(storage, `profile-pictures/${user.id}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);
      
      await updateDoc(doc(db, 'users', user.id), {
        photoURL
      });
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const onUpdateSubmit = async (data: UserUpdateForm) => {
    try {
      setError(null);
      const updates: Record<string, any> = {
        name: data.name,
        email: data.email,
      };

      // Only include companyId in updates if user is staff/consultant
      if (user.role === 'staff' || user.role === 'consultant') {
        updates.companyId = data.companyId || null;
      }
      
      // Update email in Firebase Auth if it changed
      if (data.email !== user.email && auth.currentUser) {
        await updateEmail(auth.currentUser, data.email);
      }
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.id), updates);
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const onPasswordSubmit = async (data: PasswordUpdateForm) => {
    try {
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      // First reauthenticate the user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        data.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Then update the password
      await updatePassword(auth.currentUser, data.newPassword);
      setIsChangingPassword(false);
      resetPassword();
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else {
        setError('Failed to update password. Please try again.');
      }
      console.error('Error updating password:', err);
    }
  };

  const infoItems = [
    {
      icon: User,
      label: t.name,
      value: user.name,
      editable: true,
    },
    {
      icon: Mail,
      label: t.email,
      value: user.email,
      editable: true,
    },
    {
      icon: Shield,
      label: t.role,
      value: user.role === 'staff' ? t.staff : t.customer,
      editable: false,
    },
    {
      icon: Calendar,
      label: t.memberSince,
      value: user.createdAt instanceof Date && isValid(user.createdAt)
        ? format(user.createdAt, 'PP')
        : format(new Date(), 'PP'),
      editable: false,
    },
  ];

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title={t.profile}
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-2">
          {uploadingImage ? (
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <ImageUpload
              onChange={handleImageChange}
              currentImageUrl={user.photoURL}
            />
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateSubmit(onUpdateSubmit)} className="space-y-4">
            <Input
              label={t.name}
              error={updateErrors.name?.message}
              {...registerUpdate('name')}
            />
            
            <Input
              label={t.email}
              type="email"
              error={updateErrors.email?.message}
              {...registerUpdate('email')}
            />
            
            {(user.role === 'staff' || user.role === 'consultant') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <select
                  className={cn(
                    "w-full px-3 py-2 border rounded-md shadow-sm",
                    "text-gray-900 dark:text-gray-100",
                    "bg-white dark:bg-gray-800",
                    "border-gray-300 dark:border-gray-700",
                    "focus:ring-blue-500 focus:border-blue-500"
                  )}
                  {...registerUpdate('companyId')}
                >
                  <option value="">No company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isUpdating}
              >
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        ) : isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />
            
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsChangingPassword(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isUpdatingPassword}
              >
                <Check className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          </form>
        ) : (
          <>
          <div className="space-y-4">
          {infoItems.map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <p className="font-medium">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsChangingPassword(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          </>
        )}
      </div>
    </Dialog>
  );
}