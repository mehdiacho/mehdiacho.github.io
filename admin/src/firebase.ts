/**
 * Firebase wiring for the admin console.
 *
 * Same `mehdi-00` project the public site reads from — this app is just the
 * write side of the same database. The config below is the public web config
 * (Google ships it in client code); the actual protection is in
 * firestore.rules / storage.rules, which only accept writes from the verified
 * owner account.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBABhCSUEqUlX998QaAYICFsIP9eUKkcBc',
  authDomain: 'mehdi-00.firebaseapp.com',
  projectId: 'mehdi-00',
  storageBucket: 'mehdi-00.firebasestorage.app',
  messagingSenderId: '857525867185',
  appId: '1:857525867185:web:562abddbe8ea24b9db8890',
  measurementId: 'G-N70BVPZ6JP',
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/** The only account the rules will accept writes from. */
export const OWNER_EMAIL = 'mehdiacho@gmail.com';

export const googleProvider = new GoogleAuthProvider();
// Always show the chooser — this account is often one of several signed in.
googleProvider.setCustomParameters({ prompt: 'select_account' });
