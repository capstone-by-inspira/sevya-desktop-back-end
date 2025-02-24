// import admin from "firebase-admin";
// import dotenv from "dotenv";

// dotenv.config();

// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//   }),
// });

// export default admin;


import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Firebase Client Config
// const firebaseConfig = {
//   apiKey: "AIzaSyBX2gmQbTyv77Bep4DKVQrC--OVSx37q7s",
//   authDomain: "sevya-f77df.firebaseapp.com",
//   projectId: "sevya-f77df",
//   storageBucket: "sevya-f77df.firebasestorage.app",
//   messagingSenderId: "62869950842",
//   appId: "1:62869950842:web:f0f59cb17ec508dbd786c3",
//   measurementId: "G-E5Q564BTJ1"
// };


// // Initialize Firebase App (for frontend authentication)
// const firebaseApp = initializeApp(firebaseConfig);
// const firebaseAuth = getAuth(firebaseApp);
// const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Admin SDK (for backend token verification)
const firebaseAdmin = admin.initializeApp({
 // credential: admin.credential.cert(FirebaseServiceAccount),
   credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
});

const db = firebaseAdmin.firestore();
const auth = firebaseAdmin.auth();

const serverTimestamp = FieldValue.serverTimestamp()

export { firebaseAdmin , db, auth, serverTimestamp};

