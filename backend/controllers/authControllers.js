const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Helper: generate a JWT for a user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
};

/**
 * Helper: strip sensitive fields and return safe user object
 */
const safeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Trim and lowercase to prevent accidental mismatches
    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting signup for: ${email}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[AUTH] Signup failed: User already exists (${email})`);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log(`[AUTH] Signup successful: ${email}`);
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // Trim and lowercase to match signup normalization
    email = email.trim().toLowerCase();
    console.log(`[AUTH] Attempting login for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] Login failed: User not found (${email})`);
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH] Login failed: Invalid password (${email})`);
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user._id);

    console.log(`[AUTH] Login successful: ${email}`);
    res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ROLE (protected) =================
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id; // from JWT middleware

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("UPDATE ROLE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, updateRole };
