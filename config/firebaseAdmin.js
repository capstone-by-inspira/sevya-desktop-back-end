

import admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import dotenv from "dotenv";


dotenv.config();



const firebaseAdmin = admin.initializeApp({

   credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
});

const db = firebaseAdmin.firestore();
const auth = firebaseAdmin.auth();

const serverTimestamp = FieldValue.serverTimestamp()

export { firebaseAdmin , db, auth, serverTimestamp, admin};

