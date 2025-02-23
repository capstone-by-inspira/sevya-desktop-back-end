import express from "express";
import admin from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8800/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user;
        try {
          user = await admin.auth().getUserByEmail(profile.emails[0].value);
        } catch (error) {
          user = await admin.auth().createUser({
            email: profile.emails[0].value,
            displayName: profile.displayName,
            photoURL: profile.photos[0]?.value,
          });
        }

        const jwtToken = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: "1h" });

        done(null, { uid: user.uid, jwtToken });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Email/Password Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const jwtToken = jwt.sign({ uid: userRecord.uid }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token: jwtToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Email/Password Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const response = await axios.post(FIREBASE_AUTH_URL, { email, password, returnSecureToken: true });
      const { localId, idToken, email: userEmail, displayName, photoUrl } = response.data;
  
      // Generate a JWT token for backend authentication
      const jwtToken = jwt.sign({ uid: localId }, JWT_SECRET, { expiresIn: "1h" });
  
      // Send both token and user info
      res.status(200).json({
        token: jwtToken,
        user: {
          uid: localId,
          email: userEmail,
          displayName: displayName || "Anonymous",
          photoUrl: photoUrl || "",
        },
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
  

// Google Auth Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  res.json({ token: req.user.jwtToken });
});

export default router;
