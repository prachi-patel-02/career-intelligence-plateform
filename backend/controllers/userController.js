const User = require("../models/user");

/**
 * Helper: strip sensitive fields
 */
const safeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// ================= GET PROFILE =================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: safeUser(user) });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE ONBOARDING =================
const saveOnboarding = async (req, res) => {
  try {
    const { role, selectedSkills, skills } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const updateData = {
      role,
      selectedSkills: selectedSkills || [],
      onboardingCompleted: true,
    };

    // If frontend sends pre-built skills array, save it
    if (skills && Array.isArray(skills) && skills.length > 0) {
      updateData.skills = skills;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Onboarding saved successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("SAVE ONBOARDING ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE SKILLS =================
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills array is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { skills } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Skills updated successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("UPDATE SKILLS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE ASSESSMENTS =================
const updateAssessments = async (req, res) => {
  try {
    const { assessmentTests, assessmentResults, assessmentBestScores } = req.body;

    const updateData = {};
    if (assessmentTests !== undefined) updateData.assessmentTests = assessmentTests;
    if (assessmentResults !== undefined) updateData.assessmentResults = assessmentResults;
    if (assessmentBestScores !== undefined) updateData.assessmentBestScores = assessmentBestScores;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Assessments updated successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("UPDATE ASSESSMENTS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE BLOOM TASKS =================
const updateBloom = async (req, res) => {
  try {
    const { bloomTasks } = req.body;

    if (!bloomTasks || !Array.isArray(bloomTasks)) {
      return res.status(400).json({ message: "bloomTasks array is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bloomTasks } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Bloom tasks updated successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("UPDATE BLOOM ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE CACHED ROADMAP =================
const saveCachedRoadmap = async (req, res) => {
  try {
    const { cachedRoadmap } = req.body;

    if (!cachedRoadmap) {
      return res.status(400).json({ message: "cachedRoadmap is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { cachedRoadmap } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Roadmap cached successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("SAVE CACHED ROADMAP ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ================= SAVE RESUME =================
const saveResume = async (req, res) => {
  try {
    const { resumeData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { resumeData } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Resume saved successfully",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("SAVE RESUME ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  saveOnboarding,
  updateSkills,
  updateAssessments,
  updateBloom,
  saveResume,
  saveCachedRoadmap,
};
