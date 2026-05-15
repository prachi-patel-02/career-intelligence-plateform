const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  getProfile,
  saveOnboarding,
  updateSkills,
  updateAssessments,
  updateBloom,
  saveResume,
  saveCachedRoadmap,
} = require("../controllers/userController");

// All routes are protected by JWT middleware
router.get("/profile", authMiddleware, getProfile);
router.post("/onboarding", authMiddleware, saveOnboarding);
router.put("/skills", authMiddleware, updateSkills);
router.put("/assessments", authMiddleware, updateAssessments);
router.put("/bloom", authMiddleware, updateBloom);
router.put("/resume", authMiddleware, saveResume);
router.put("/cached-roadmap", authMiddleware, saveCachedRoadmap);

module.exports = router;
