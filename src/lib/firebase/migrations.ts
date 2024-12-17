import { db } from './firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

export async function addRemainingHoursPercentageField() {
  const cardsRef = collection(db, 'cards');
  const snapshot = await getDocs(cardsRef);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const remainingHoursPercentage = (data.remainingHours / data.totalHours) * 100;
    
    batch.update(doc.ref, {
      remainingHoursPercentage
    });
  });
  
  await batch.commit();
}

export async function addCustomerIdToTimeEntries() {
  const timeEntriesRef = collection(db, 'timeEntries');
  const snapshot = await getDocs(timeEntriesRef);
  
  const batch = writeBatch(db);
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const cardDoc = await getDoc(doc(db, 'cards', data.cardId));
    
    if (cardDoc.exists()) {
      batch.update(doc.ref, {
        customerId: cardDoc.data().customerId
      });
    }
  }
  
  await batch.commit();
}