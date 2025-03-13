

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
    storageBucket:process.env.FIREBASE_STORAGE_BUCKET

});

const db = firebaseAdmin.firestore();
const auth = firebaseAdmin.auth();
const bucket = firebaseAdmin.storage().bucket();


const serverTimestamp = FieldValue.serverTimestamp()

export { firebaseAdmin , db, auth, bucket, serverTimestamp, admin};

