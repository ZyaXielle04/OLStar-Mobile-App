// firebaseConfig.js

import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDhzDZE1a4s2WDSGJQ6jU1Q6Fp3vDJrid0",
  authDomain: "olstar-website-45f8a.firebaseapp.com",
  databaseURL: "https://olstar-website-45f8a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "olstar-website-45f8a",
  storageBucket: "olstar-website-45f8a.firebasestorage.app",
  messagingSenderId: "885674115344",
  appId: "1:885674115344:web:8094c05ac943de03706595",
  measurementId: "G-Y9N3T9TYZX"
};

// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);

// INITIALIZE AUTH WITH PERSISTENCE
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// REALTIME DATABASE
export const database = getDatabase(app);

export { firebaseConfig };
export default app;