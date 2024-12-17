import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

export function useCustomers(searchQuery: string = '') {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    setLoading(true);
    setError(null);

    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as User));

        const filteredUsers = users.filter(user => 
          searchQuery === '' || 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setCustomers(filteredUsers);
        setLoading(false);
        setInitialized(true);
      },
      (err) => {
        setError('Failed to fetch customers');
        console.error('Error fetching customers:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;
    
    const filtered = customers.filter(user => 
      searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setCustomers(filtered);
  }, [searchQuery, initialized]);

  return { customers, loading, error };
}