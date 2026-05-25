
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD39ihyJvTmy3kERj_Ct4SPZkYFIpUgMjM",
  authDomain: "pool-hockey-5d1d0.firebaseapp.com",
  projectId: "pool-hockey-5d1d0",
  storageBucket: "pool-hockey-5d1d0.firebasestorage.app",
  messagingSenderId: "1030892892347",
  appId: "1:1030892892347:web:c88a5cbcb25fe63ec1799e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider };
