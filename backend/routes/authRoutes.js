const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const { signup, login, updateRole } = require("../controllers/authControllers");

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-role", authMiddleware, updateRole);

module.exports = router;
