/**
 * Centralized API configuration for the Career Intelligence Platform.
 * Uses NEXT_PUBLIC_API_URL from environment variables or falls back to localhost for development.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    UPDATE_ROLE: `${API_BASE_URL}/api/auth/update-role`,
  },
  USER: {
    PROFILE: `${API_BASE_URL}/api/user/profile`,
    ONBOARDING: `${API_BASE_URL}/api/user/onboarding`,
    SKILLS: `${API_BASE_URL}/api/user/skills`,
    ASSESSMENTS: `${API_BASE_URL}/api/user/assessments`,
    BLOOM: `${API_BASE_URL}/api/user/bloom`,
    RESUME: `${API_BASE_URL}/api/user/resume`,
    CACHED_ROADMAP: `${API_BASE_URL}/api/user/cached-roadmap`,
  },
  ROADMAP: {
    GENERATE: `${API_BASE_URL}/api/ai-roadmap`,
  },
  HEALTH: `${API_BASE_URL}/api/health`,
};
