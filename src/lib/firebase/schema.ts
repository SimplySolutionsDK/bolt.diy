import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Collection References
export const usersRef = collection(db, 'users');
export const cardsRef = collection(db, 'cards');
export const timeEntriesRef = collection(db, 'timeEntries');
export const notificationPreferencesRef = collection(db, 'notificationPreferences');
export const messagesRef = collection(db, 'messages');

// Common Queries
export const getActiveCardsByCustomer = (customerId: string) => 
  query(
    cardsRef,
    where('customerId', '==', customerId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

export const getLowBalanceCards = () =>
  query(
    cardsRef,
    where('status', '==', 'active'),
    where('remainingHoursPercentage', '<=', 20)
  );

export const getExpiringCards = (expiryThreshold: Date) =>
  query(
    cardsRef,
    where('status', '==', 'active'),
    where('expiryDate', '<=', expiryThreshold)
  );

export const getTimeEntriesByCard = (cardId: string) =>
  query(
    timeEntriesRef,
    where('cardId', '==', cardId),
    orderBy('serviceDate', 'desc'),
    orderBy('__name__', 'desc')
  );

export const getCustomerTimeEntries = (customerId: string) =>
  query(
    timeEntriesRef,
    where('customerId', '==', customerId),
    orderBy('serviceDate', 'desc'),
    orderBy('__name__', 'desc')
  );

export const getFeatureMessages = (featureId: string) => 
  query(
    messagesRef,
    where('featureId', '==', featureId),
    orderBy('createdAt', 'asc')
  );