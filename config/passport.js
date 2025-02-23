import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import admin from "./firebaseAdmin.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.GOOGLE_REDIRECT_URI}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile:", profile);
  
          const user = {
            uid: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          };
  
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  