import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { translations } from '@/utils/translations';

export async function generateCardNumber(): Promise<string> {
  const prefix = 'PC'; // Prepaid Card
  const length = 8;
  let isUnique = false;
  let cardNumber = '';
  
  while (!isUnique) {
    // Generate random number
    const randomNum = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    
    cardNumber = `${prefix}${randomNum}`;
    
    // Check if number exists
    const q = query(
      collection(db, 'cards'),
      where('cardNumber', '==', cardNumber)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    }
  }
  
  return cardNumber;
}

export function formatHours(hours: number, language: string = 'en'): string {
  if (language === 'da') {
    return `${hours} ${hours === 1 ? 'time' : 'timer'}`;
  }
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
}

export function formatCardNumber(cardNumber: string): string {
  // Format as PC-XXXXXXXX
  return `${cardNumber.slice(0, 2)}-${cardNumber.slice(2)}`;
}

export function getCardStatus(card: PrepaidCard, language: string = 'en'): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  const t = translations[language].cards.status;

  if (card.status === 'inactive') {
    return { label: t.inactive, color: 'gray' };
  }
  
  const remainingPercentage = (card.remainingHours / card.totalHours) * 100;
  
  if (remainingPercentage <= 20) {
    return { label: t.lowBalance, color: 'red' };
  }
  
  if (remainingPercentage <= 50) {
    return { label: t.mediumBalance, color: 'yellow' };
  }
  
  return { label: t.goodBalance, color: 'green' };
}