import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBw4fzbrMn-nZWRMlHItTu2CrHO0OtoKYU",
  authDomain: "insightforge-828ee.firebaseapp.com",
  projectId: "insightforge-828ee",
  storageBucket: "insightforge-828ee.firebasestorage.app",
  messagingSenderId: "53050039538",
  appId: "1:53050039538:web:c4c409ea2372e87404046b",
  measurementId: "G-P8P0335CES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Log project ID for debugging
console.log('🔥 Client Firebase projectId:', app.options.projectId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;

