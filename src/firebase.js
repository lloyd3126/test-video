// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBblGol55Gr9Lg-vks3nF_ijcjeWkkPINc",
  authDomain: "test-video-ea610.firebaseapp.com",
  projectId: "test-video-ea610",
  storageBucket: "test-video-ea610.appspot.com",
  messagingSenderId: "281672867191",
  appId: "1:281672867191:web:8f21ff3decdff5452d5572",
  measurementId: "G-1C2L98TSNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)
const analytics = getAnalytics(app);

export {analytics, db}
