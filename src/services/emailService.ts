import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import type { User } from '@/types';

interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}

export async function sendEmailNotification(
  user: User,
  template: string,
  data: Record<string, any>
) {
  try {
    // Store the email notification in Firestore
    // This will be picked up by a Cloud Function that actually sends the email
    await addDoc(collection(db, 'emailNotifications'), {
      to: user.email,
      subject: getEmailSubject(template),
      template,
      data,
      status: 'pending',
      createdAt: Timestamp.now(),
    } as EmailNotification);
    
    return true;
  } catch (error) {
    console.error('Failed to queue email notification:', error);
    return false;
  }
}

function getEmailSubject(template: string): string {
  const subjects: Record<string, string> = {
    'card-created': 'Your new prepaid card is ready',
    'low-balance': 'Low balance alert for your prepaid card',
    'card-expiring': 'Your prepaid card is expiring soon',
    'time-logged': 'New time entry logged',
  };
  
  return subjects[template] || 'TickTalk Notification';
}