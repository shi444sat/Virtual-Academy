// public-site/js/utils/firestore.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

import { db } from '../firebase-config.js';

const firestoreService = {

  async getDocument(collectionName, docId) {
    const ref = doc(db, collectionName, docId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  async getDocuments(collectionName) {
    const snap = await getDocs(collection(db, collectionName));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async saveDocument(collectionName, docId, data) {
    return setDoc(doc(db, collectionName, docId), data);
  },

  async addDocument(collectionName, data) {
    return addDoc(collection(db, collectionName), data);
  }

};

export default firestoreService;
