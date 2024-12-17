// Cloud Functions Triggers

import * as functions from 'firebase-functions';
import { db } from '../firebase';
import { getDoc } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';
import { sendEmailNotification } from '../../services/emailService';

exports.onCardUpdate = functions.firestore
  .document('cards/{cardId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    
    const customerDoc = await getDoc(doc(db, 'users', newData.customerId));
    if (!customerDoc.exists()) return;
    
    const customer = customerDoc.data();
    
    // Check for low balance
    if (newData.remainingHours / newData.totalHours <= 0.2) {
      await sendEmailNotification(customer, 'low-balance', {
        cardNumber: newData.cardNumber,
        remainingHours: newData.remainingHours,
        totalHours: newData.totalHours,
      });
    }
    
    // Check for approaching expiration
    if (newData.expiryDate) {
      const daysUntilExpiry = differenceInDays(newData.expiryDate, new Date());
      if (daysUntilExpiry <= 14) {
        await sendEmailNotification(customer, 'card-expiring', {
          cardNumber: newData.cardNumber,
          expiryDate: newData.expiryDate,
          daysUntilExpiry,
        });
      }
    }
  });

exports.processEmailNotifications = functions.firestore
  .document('emailNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    
    try {
      // Here you would integrate with your email service provider
      // (e.g., SendGrid, Mailgun, etc.) to actually send the email
      
      // For now, we'll just mark it as sent
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
      });
    }
  });

exports.onTimeEntryCreate = functions.firestore
  .document('timeEntries/{entryId}')
  .onCreate(async (snap, context) => {
    const entry = snap.data();
    
    const cardDoc = await getDoc(doc(db, 'cards', entry.cardId));
    if (!cardDoc.exists()) return;
    
    const card = cardDoc.data();
    const customerDoc = await getDoc(doc(db, 'users', card.customerId));
    if (!customerDoc.exists()) return;
    
    const customer = customerDoc.data();
    
    // Send email notification
    await sendEmailNotification(customer, 'time-logged', {
      cardNumber: card.cardNumber,
      hoursDeducted: entry.hoursDeducted,
      remainingHours: card.remainingHours - entry.hoursDeducted,
      serviceDate: entry.serviceDate,
      consultantName: entry.consultantName,
    });
  });