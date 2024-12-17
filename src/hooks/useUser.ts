import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export function useUser(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        }
      } catch (err) {
        setError('Failed to fetch user');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}