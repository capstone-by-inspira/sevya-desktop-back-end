import express from "express";
import {firebaseAdmin, db, serverTimestamp} from "../config/firebaseAdmin.js";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;





// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

/**
 * Create a document in any Firestore collection
 * @route POST /api/:collection
 */
router.post("/:collection", verifyJWT, async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;
    const docRef = await db.collection(collection).add({ ...data, createdAt: new Date() });

    res.json({ id: docRef.id, ...data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create document" });
  }
});

/**
 * Get all documents from a Firestore collection
 * @route GET /api/:collection
 */
router.get("/:collection", verifyJWT, async (req, res) => {
  try {
    const { collection } = req.params;
    const snapshot = await db.collection(collection).get();
    const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * Get documents by dynamic key-value pair
 * @route GET /api/:collection/query
 */
router.get("/:collection/query", verifyJWT, async (req, res) => {
  try {
    const { collection } = req.params;
    const { key, value } = req.query;

    console.log('request', req.query);
    if (!key || !value) {
      return res.status(400).json({ error: "Key and value must be provided" });
    }

    const querySnapshot = await db
      .collection(collection)
      .where(key, "==", value)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "No documents found" });
    }

    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * Get a single document by ID
 * @route GET /api/:collection/:id
 */
router.get("/:collection/:id", verifyJWT, async (req, res) => {
  try {
    const { collection, id } = req.params;
    console.log('request id', req.query, req.params);
    const doc = await db.collection(collection).doc(id).get();

    if (!doc.exists) return res.status(404).json({ error: "Document not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

/**
 * Update a document by ID
 * @route PUT /api/:collection/:id
 */
router.put("/:collection/:id", verifyJWT, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const data = req.body;

    await db.collection(collection).doc(id).update({ ...data, updatedAt: new Date() });
    res.json({ id, ...data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update document" });
  }
});

/**
 * Delete a document by ID
 * @route DELETE /api/:collection/:id
 */
router.delete("/:collection/:id", verifyJWT, async (req, res) => {
  try {
    const { collection, id } = req.params;
    await db.collection(collection).doc(id).delete();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;