const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

console.log("AUTH CONTROLLER RUNNING");

// ================= SIGNUP =================
const signup = async (req, res) => {
  console.log("SIGNUP REQUEST RECEIVED:", req.body?.email);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Signup failed: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Signup failed: User exists", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("Signup success:", email);
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("SIGNUP ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  console.log("LOGIN REQUEST RECEIVED:", req.body?.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Login failed: Missing email/password");
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Login failed: User not found", email);
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Login failed: Invalid password", email);
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" },
    );

    console.log("Login success:", email);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ROLE =================
const updateRole = async (req, res) => {
  console.log("UPDATE ROLE REQUEST RECEIVED:", req.body?.userId);
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      console.log("Update role failed: Missing userId/role");
      return res.status(400).json({ message: "UserId and role required" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      console.log("Update role failed: User not found", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Update role success:", userId, role);
    res.status(200).json({
      message: "Role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("UPDATE ROLE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, updateRole };
