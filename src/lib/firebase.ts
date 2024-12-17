import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Analytics, getAnalytics } from 'firebase/analytics';



const firebaseConfig = {
  apiKey: "AIzaSyC8sRXrJBPgHAaCWNNgBLrmuhCnfVif2SE",
  authDomain: "simply-solutions-klippekort.firebaseapp.com",
  projectId: "simply-solutions-klippekort",
  storageBucket: "simply-solutions-klippekort.firebasestorage.app",
  messagingSenderId: "405368533040",
  appId: "1:405368533040:web:b7e9c6e6857511dff3fdf5",
  measurementId: "G-H1STS0CD6D"
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
let analytics: Analytics | null = null;

// Conditional import of Analytics for client-side only
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
// Export Analytics for client-side use
export { analytics };
