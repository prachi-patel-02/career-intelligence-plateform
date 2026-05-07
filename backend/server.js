const express = require("express");
const cors = require("cors");
require("dotenv").config();

// DB connect
const connectDB = require("./config/db");

// routes
const authRoutes = require("./routes/authRoutes");

// create app
const app = express();

// connect database
connectDB();

// middleware
app.use(cors({
  origin: "*", // In production, you might want to specify your Vercel URL here
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// routes
app.use("/api/auth", authRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is running" });
});

// test route
app.get("/", (req, res) => {
  res.send("career intelligence API is active");
});

// PORT
const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
