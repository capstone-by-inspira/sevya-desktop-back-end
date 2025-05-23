import express from "express";
import {
  firebaseAdmin,
  db,
  serverTimestamp,
  bucket,
} from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateHealthPlan } from '../utils/geminiAi.js'

import { sendWelcomeEmail } from "../utils/nodemailer.js";
import multer from "multer";
import { translatePatientNotes } from '../utils/googleTranslation.js';



dotenv.config();

const router = express.Router();

// Email/Password Signup
const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", async (req, res) => {
  try {
    const { user } = req.body;

    const email = user.email;
    const password = user.password;
    const name = user.firstName + " " + user.lastName;
    const collectionName = user.collectionName;

    const { password: _, collectionName: __, ...filteredUser } = user;

    // Create user in Firebase Authentication
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await db
      .collection(collectionName)
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        ...filteredUser,
        createdAt: serverTimestamp,
      });

    // Generate JWT Token
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    if (collectionName == "caregivers") {
      await sendWelcomeEmail(name, email, password);
    }

    res.json({ message: "User created successfully", token, user: userRecord });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(400).json({ error: error.message });
  }
});

router.delete("/deleteUser", async (req, res) => {
  const { uid } = req.body;
  console.log(uid);

  try {
    await firebaseAdmin.auth().deleteUser(uid);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/firebase", async (req, res) => {
  try {
    const { idToken, collectionName } = req.body;
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    console.log(decodedToken);
    const { uid, email, name } = decodedToken;

    const caregiverRef = db.collection("caregivers").doc(uid);
    const caregiverDoc = await caregiverRef.get();

    if (caregiverDoc.exists) {
      return res
        .status(403)
        .json({ error: "Access denied. Caregivers are not allowed." });
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

    const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: jwtToken, user: { uid, email, name } });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

router.post("/caregiver/firebase", async (req, res) => {
  try {
    const { idToken, collectionName } = req.body;
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    console.log(decodedToken);
    const { uid, email, name } = decodedToken;

    const caregiverRef = db.collection("caregivers").doc(uid);
    const caregiverDoc = await caregiverRef.get();

    if (!caregiverDoc.exists) {
      return res
        .status(403)
        .json({ error: "Contact your agency for credintials." });
    }



    const jwtToken = jwt.sign({ uid, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token: jwtToken, user: { uid, email, name } });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

router.post('/generate-health-plan', async (req, res) => {
  const { patientData } = req.body;
  try {
    if (!patientData) {
      return res.status(400).json({ error: 'Patient data is required' });
    }

    // Call the utility function to generate the healthcare plan
    const plan = await generateHealthPlan(patientData);

    // Send the plan back as a response
    res.json(plan);
  } catch (error) {
    console.error('Error in /generate-health-plan route:', error);
    res.status(500).json({ error: 'Failed to generate healthcare plan' });
  }
});
router.post('/translate-notes', async (req, res) => {
  // const { notes, language } = req.body;
  console.log('req', req.body);
  const {patientData} = req.body;
  const { notes, language } = patientData;
  console.log('notes,', notes);
  try {
    if (!notes && !language) {
      return res.status(400).json({ error: 'Content is required to translate' });
    }
    const translatedData = await translatePatientNotes(notes, language);

    res.json({ translatedText: translatedData });
  } catch (error) {
    console.error('Error in translate route:', error);
    res.status(500).json({ error: 'Failed to translate' });
  }
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }


    const fileName = `${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(`images/${fileName}`);

    // Upload to Firebase Storage
    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    stream.on("error", (error) => {
      console.error("Upload Error:", error);
      return res.status(500).json({ error: "Upload failed" });
    });

    stream.on("finish", async () => {
      // Make the file public
      await file.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      console.log("Image uploaded:", imageUrl);
      return res.status(200).json({ imageUrl });
    });

    stream.end(req.file.buffer); // Only call this once!
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/upload-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(`audios/${fileName}`);

    const stream = file.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });
    stream.end(req.file.buffer);

    stream.on("finish", async () => {
      await file.makePublic();
      const audioUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      res.status(200).json({ audioUrl: audioUrl });
    });

    stream.on("error", (error) => {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Upload failed" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
