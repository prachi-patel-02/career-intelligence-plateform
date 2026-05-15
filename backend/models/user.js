const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['concept', 'task', 'project', 'interview', 'custom'],
      default: 'task'
    },
    description: { type: String, default: "" },
    stage: { type: String, default: "" },
    points: { type: Number, default: 0 },
    resource: { type: String, default: "" },
    resumeReady: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    tasks: [taskSchema],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ── Auth ──
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },

    // ── Onboarding ──
    role: {
      type: String,
      default: "",
    },
    selectedSkills: {
      type: [String],
      default: [],
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // ── Skills & Progress ──
    skills: {
      type: [skillSchema],
      default: [],
    },

    // ── Assessments ──
    assessmentTests: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    assessmentResults: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    assessmentBestScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── Bloom / Gamification ──
    bloomTasks: {
      type: [String],
      default: [],
    },
    streak: {
      current: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: "" },
    },

    // ── Resume ──
    resumeData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // ── AI ──
    cachedRoadmap: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false, // preserve empty objects like {}
  }
);

module.exports = mongoose.model("User", userSchema);
