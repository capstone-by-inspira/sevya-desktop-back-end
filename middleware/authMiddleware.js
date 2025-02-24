// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();
// const JWT_SECRET = process.env.JWT_SECRET;

// export const authenticateJWT = (req, res, next) => {
//   const token = req.headers.authorization?.split("Bearer ")[1];

//   if (!token) {
//     return res.status(403).json({ error: "Access denied, token missing" });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: "Invalid token" });
//     }
//     req.user = user;
//     next();
//   });
// };
