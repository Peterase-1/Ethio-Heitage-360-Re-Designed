// Clear authentication cache and force reload
console.log('🧹 Clearing authentication cache...');

// Clear all authentication-related data
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('refreshToken');
localStorage.removeItem('authData');

// Clear any corrupted tokens
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('token') || key.includes('auth') || key.includes('user')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ Authentication cache cleared');
console.log('🔄 Please refresh the page and log in again');

// Force page reload
window.location.reload();


