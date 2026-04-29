const express = require("express");
const router = express.Router();

const { signup, login, updateRole } = require("../controllers/authControllers");

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-role", updateRole);
module.exports = router;
