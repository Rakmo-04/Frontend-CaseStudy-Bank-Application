// Development Configuration - Real APIs Only
export const DEV_CONFIG = {
  // No mock mode - always use real backend
  ENABLE_REAL_API_ONLY: true,
  
  // API Configuration
  API_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Debug logging
  ENABLE_API_LOGGING: true,
  ENABLE_AUTH_LOGGING: true,
  
  // Development helpers
  AUTO_LOGIN_ADMIN: false, // Set to true for quick admin testing
  AUTO_LOGIN_CUSTOMER: false, // Set to true for quick customer testing
};

// Helper functions for real API calls
export const apiConfig = {
  timeout: DEV_CONFIG.API_TIMEOUT,
  retries: DEV_CONFIG.RETRY_ATTEMPTS,
  enableLogging: DEV_CONFIG.ENABLE_API_LOGGING
};

export const authConfig = {
  enableLogging: DEV_CONFIG.ENABLE_AUTH_LOGGING,
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
};