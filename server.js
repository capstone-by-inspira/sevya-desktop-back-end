import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import { WebSocketServer } from "ws"; // Import WebSocket Server
import http from "http"; // Import HTTP module for WebSocket integration

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create an HTTP server (necessary for WebSockets)
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");

  // Add client to the set
  clients.add(ws);

  ws.on("message", (message) => {
    console.log("Received:", message);
    // Broadcast the message to all connected clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/document", userRoutes);

// Start server with WebSockets
server.listen(PORT, () => {
  console.log(`Server running at http://192.168.1.212:${PORT}`);
});
