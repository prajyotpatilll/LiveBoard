import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed frontend origins from .env
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",") || [
  "http://localhost:5173",
];

// CORS middleware for Express
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked CORS origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};
app.use(cors(corsOptions));

// Optional: handle preflight manually
app.options("*", cors(corsOptions));

// Basic health check route
app.get("/", (req, res) => {
  res.send("✅ LiveBoard server is running");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked Socket.IO CORS origin:", origin);
        callback(new Error("Not allowed by Socket.IO CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // ✅ Remove this line or set both transports
  // transports: ["websocket"],
});


// Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Handle drawing events
  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  // Handle chat messages
  socket.on("message", (text) => {
    io.emit("message", text); // Broadcast to all, including sender
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
