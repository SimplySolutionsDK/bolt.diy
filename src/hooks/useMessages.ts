import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc,
  doc,
  Timestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Message, User } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useInView } from 'react-intersection-observer';

export function useMessages(featureId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();
  const { ref: messageRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (!featureId) return;
    setMessages([]);

    const q = query(
      collection(db, 'messages'),
      where('featureId', '==', featureId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readBy: doc.data().readBy || [],
      })) as Message[];

      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [featureId]);

  // Mark messages as read when they come into view
  useEffect(() => {
    if (!inView || !currentUser || !featureId || messages.length === 0) return;

    const markMessagesAsRead = async () => {
      const batch = [];
      
      for (const message of messages) {
        // Skip if message is already read by current user
        if (message.readBy.some(read => read.userId === currentUser.id)) continue;

        // Only mark as read if the message meets the role criteria
        const shouldMarkAsRead = (
          (currentUser.role === 'customer' && message.createdBy !== currentUser.id) ||
          (currentUser.role === 'staff' && message.createdBy !== currentUser.id)
        );

        if (shouldMarkAsRead) {
          const messageRef = doc(db, 'messages', message.id);
          batch.push(updateDoc(messageRef, {
            status: 'read',
            readBy: arrayUnion({
              userId: currentUser.id,
              readAt: Timestamp.now(),
            }),
          }));
        }
      }

      try {
        await Promise.all(batch);
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    };

    markMessagesAsRead();
  }, [inView, currentUser, featureId, messages]);

  const sendMessage = async (content: string) => {
    if (!featureId || !auth.currentUser) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'messages'), {
        featureId,
        content,
        createdBy: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        status: 'sent',
        readBy: [],
      });
    } catch (err) {
      setError('Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading, error, messageContainerRef: messageRef };
}