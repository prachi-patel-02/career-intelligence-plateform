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
  ROADMAP: {
    GENERATE: `${API_BASE_URL}/api/ai-roadmap`,
  },
  HEALTH: `${API_BASE_URL}/api/health`,
};
