// Environment utilities for browser-safe access to environment variables

/**
 * Safely get environment variable value
 * @param key Environment variable key
 * @param defaultValue Default value if environment variable is not available
 * @returns Environment variable value or default
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // Check if we're in a Node.js environment with process object
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Check if the variable is available on window (some build systems expose them here)
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  
  return defaultValue;
}

/**
 * Check if we're in development mode
 * @returns true if in development mode
 */
export function isDevelopment(): boolean {
  return getEnvVar('NODE_ENV', 'production') === 'development';
}

/**
 * Check if we're in production mode
 * @returns true if in production mode
 */
export function isProduction(): boolean {
  return getEnvVar('NODE_ENV', 'production') === 'production';
}

/**
 * Get API base URL
 * @returns API base URL
 */
export function getApiBaseUrl(): string {
  return getEnvVar('REACT_APP_API_URL', 'http://localhost:8080');
}

// Export common environment variables
export const ENV = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  API_URL: getApiBaseUrl(),
  IS_DEVELOPMENT: isDevelopment(),
  IS_PRODUCTION: isProduction(),
} as const;