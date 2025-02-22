import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
