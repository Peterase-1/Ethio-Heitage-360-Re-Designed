// Token validation and management utilities

/**
 * Validates if a token has the expected JWT format
 * @param {string} token - The token to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Clean the token (remove whitespace, newlines)
  token = token.trim();
  
  // Check for obvious invalid patterns
  if (token.length < 10 || !token.includes('.')) {
    console.warn('Token appears to be malformed or too short');
    return false;
  }

  // JWT tokens should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn(`Token does not have 3 parts (header.payload.signature), found ${parts.length} parts`);
    return false;
  }

  // Each part should be base64 encoded and not empty
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i] || parts[i].length === 0) {
      console.warn(`Token part ${i + 1} is empty`);
      return false;
    }

    // Check if it's valid base64
    try {
      if (i < 2) { // Don't decode signature part
        // Handle URL-safe base64 and add padding if needed
        let base64Part = parts[i].replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - base64Part.length % 4) % 4);
        base64Part += padding;
        
        const decoded = atob(base64Part);
        if (i === 0 || i === 1) {
          JSON.parse(decoded); // Should be valid JSON
        }
      }
    } catch (error) {
      console.warn(`Token part ${i + 1} is not valid base64 or JSON:`, error.message);
      return false;
    }
  }

  return true;
};

/**
 * Validates if a token is expired
 * @param {string} token - The JWT token to validate
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!isValidTokenFormat(token)) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token has expiration time
    if (payload.exp) {
      return payload.exp < currentTime;
    }
    
    // If no expiration time, consider it valid for now
    return false;
  } catch (error) {
    console.warn('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Cleans up invalid or corrupted tokens from localStorage
 */
export const cleanupCorruptedTokens = () => {
  const token = localStorage.getItem('token');
  
  if (token && !isValidTokenFormat(token)) {
    console.warn('Corrupted token detected, clearing...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    return true; // Indicates cleanup was performed
  }
  
  if (token && isTokenExpired(token)) {
    console.warn('Expired token detected, clearing...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    return true; // Indicates cleanup was performed
  }
  
  return false; // No cleanup needed
};

/**
 * Gets a valid token from localStorage, cleaning up if necessary
 * @returns {string|null} - Valid token or null
 */
export const getValidToken = () => {
  cleanupCorruptedTokens();
  const token = localStorage.getItem('token');
  
  if (token && isValidTokenFormat(token) && !isTokenExpired(token)) {
    return token;
  }
  
  return null;
};

/**
 * Safely stores a token after validation
 * @param {string} token - The token to store
 * @returns {boolean} - True if stored successfully, false otherwise
 */
export const storeToken = (token) => {
  if (!isValidTokenFormat(token)) {
    console.error('Attempted to store invalid token format');
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.error('Attempted to store expired token');
    return false;
  }
  
  localStorage.setItem('token', token);
  return true;
};

/**
 * Decodes token payload safely
 * @param {string} token - The JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeTokenPayload = (token) => {
  if (!isValidTokenFormat(token)) {
    return null;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
};
