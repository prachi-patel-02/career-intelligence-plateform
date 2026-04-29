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
app.use(cors());
app.use(express.json());

//  add this
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("career intelligence ");
});

// PORT
const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
