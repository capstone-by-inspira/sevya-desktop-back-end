import express from "express";
import { db } from "../config/firebaseAdmin";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// **Middleware to Verify JWT**
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid Token" });
    req.user = decoded;
    next();
  });
};

// **CRUD Operations on Firestore "users" Collection**
const usersCollection = db.collection("users");

// **Create User**
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = { name, email, createdAt: new Date() };
    const docRef = await usersCollection.add(newUser);
    res.json({ id: docRef.id, ...newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// **Read All Users**
router.get("/", verifyJWT, async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// **Read Single User**
router.get("/:id", verifyJWT, async (req, res) => {
  try {
    const doc = await usersCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// **Update User**
router.put("/:id", verifyJWT, async (req, res) => {
  try {
    const { name, email } = req.body;
    await usersCollection.doc(req.params.id).update({ name, email });
    res.json({ id: req.params.id, name, email });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// **Delete User**
router.delete("/:id", verifyJWT, async (req, res) => {
  try {
    await usersCollection.doc(req.params.id).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
