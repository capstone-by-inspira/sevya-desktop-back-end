import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db, auth } from "./firebaseAdmin.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


// Route to fetch all users from Firestore
app.get("/users", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});


app.get("/check-db", async (req, res) => {
  try {
    await db.collection("test").doc("connectionCheck").set({ status: "connected" });
    res.json({ message: "Successfully connected to Firebase Firestore!" });
  } catch (error) {
    console.error("Firestore connection error:", error);
    res.status(500).json({ error: "Failed to connect to Firestore" });
  }
});

// Route to add a new user to Firestore
app.post("/users", async (req, res) => {
  const { userId, name, email } = req.body;
  try {
    await db.collection("users").doc(userId).set({ name, email });
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding user" });
  }
});

// Route to verify Firebase authentication token
app.post("/verify-token", async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.json({ userId: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
