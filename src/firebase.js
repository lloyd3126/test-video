// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore"
// import { getAnalytics } from "firebase/analytics";
// import {getAuth} from 'firebase/auth'

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBblGol55Gr9Lg-vks3nF_ijcjeWkkPINc",
//   authDomain: "test-video-ea610.firebaseapp.com",
//   projectId: "test-video-ea610",
//   storageBucket: "test-video-ea610.appspot.com",
//   messagingSenderId: "281672867191",
//   appId: "1:281672867191:web:8f21ff3decdff5452d5572",
//   measurementId: "G-1C2L98TSNR"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const db = getFirestore(app)
// const analytics = getAnalytics(app);
// const auth = getAuth(app)

// export {analytics, db}



import { initializeApp } from "firebase/app";

import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBblGol55Gr9Lg-vks3nF_ijcjeWkkPINc",
  authDomain: "test-video-ea610.firebaseapp.com",
  projectId: "test-video-ea610",
  storageBucket: "test-video-ea610.appspot.com",
  messagingSenderId: "281672867191",
  appId: "1:281672867191:web:8f21ff3decdff5452d5572",
  measurementId: "G-1C2L98TSNR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  signOut(auth);
};

export {
  auth,
  db,
  signInWithGoogle,
  signInWithEmailAndPassword,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  sendPasswordResetEmail
};
