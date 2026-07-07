'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    const existingApp = apps[0];
    if (existingApp.options && existingApp.options.apiKey) {
      return getSdks(existingApp);
    }
    try {
      deleteApp(existingApp).catch(() => {});
    } catch (e) {
      // ignore
    }
  }

  let firebaseApp: FirebaseApp;
  try {
    if (process.env.FIREBASE_CONFIG) {
      firebaseApp = initializeApp();
      if (!firebaseApp.options || !firebaseApp.options.apiKey) {
        try {
          deleteApp(firebaseApp).catch(() => {});
        } catch {}
        throw new Error('No API key found in automatic options');
      }
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
    }
    try {
      const currentApps = getApps();
      if (currentApps.length > 0) {
        const fallbackApp = currentApps[0];
        if (fallbackApp.options && fallbackApp.options.apiKey) {
          firebaseApp = fallbackApp;
        } else {
          try {
            deleteApp(fallbackApp).catch(() => {});
          } catch {}
          firebaseApp = initializeApp(firebaseConfig);
        }
      } else {
        firebaseApp = initializeApp(firebaseConfig);
      }
    } catch {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
