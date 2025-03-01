import express from "express";
import {firebaseAdmin, db, serverTimestamp} from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {sendWelcomeEmail} from '../utils/nodemailer.js'

dotenv.config();

const router = express.Router();

// Email/Password Signup

router.post("/signup", async (req, res) => {
    try {
      const { email, password, name , collectionName } = req.body;
  
      // Create user in Firebase Authentication
      const userRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      await db.collection(collectionName).doc(userRecord.uid).set({
        uid: userRecord.uid,
        name,
        email,
        createdAt: serverTimestamp,
      });
  

      // Generate JWT Token
      const token = jwt.sign(
        { uid: userRecord.uid, email: userRecord.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      if(collectionName == 'caregiver'){
      await sendWelcomeEmail(name, email, password);
      }

      res.json({ message: "User created successfully", token, user: userRecord });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(400).json({ error: error.message });
    }
  });
  



 

  router.post("/admin/firebase", async (req, res) => {
    try {
      const { idToken , collectionName} = req.body;
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      console.log(decodedToken);
      const { uid, email , name } = decodedToken;
  
      const caregiverRef = db.collection("caregiver").doc(uid);
      const caregiverDoc = await caregiverRef.get();

      if (caregiverDoc.exists) {
          return res.status(403).json({ error: "Access denied. Caregivers are not allowed." });
      }

      const adminRef = db.collection(collectionName).doc(uid);
        const adminDoc = await adminRef.get();

        if (!adminDoc.exists) {
            await adminRef.set({
                uid,
                email,
                name,
                createdAt: serverTimestamp,
            });
        }

     const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token: jwtToken, user: { uid, email , name} });
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ error: "Authentication failed" });
    }
  });

  router.post("/caregiver/firebase", async (req, res) => {
    try {
      const { idToken , collectionName} = req.body;
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      console.log(decodedToken);
      const { uid, email , name } = decodedToken;
  
      const caregiverRef = db.collection("caregiver").doc(uid);
      const caregiverDoc = await caregiverRef.get();

      if (!caregiverDoc.exists) {
          return res.status(403).json({ error: "Contact your agency for credintials." });
      }

     
    

     const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token: jwtToken, user: { uid, email , name} });
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ error: "Authentication failed" });
    }
  });
  



export default router;
