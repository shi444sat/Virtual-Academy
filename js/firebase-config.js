// public-site/js/firebase-config.js
import { initializeApp, getApps, getApp } 
  from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';

import { getFirestore } 
  from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDY-Zq3hABxXYm2UKDoC9c4zmZcCxBpUj0",
  authDomain: "virtual-academy-9c936.firebaseapp.com",
  projectId: "virtual-academy-9c936",
  messagingSenderId: "840956451399",
  appId: "1:840956451399:web:7df93a43617f2daa616f62"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);
