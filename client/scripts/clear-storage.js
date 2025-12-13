// Script to clear localStorage and sessionStorage
// Run this in the browser console or add it as a temporary button

console.log('Clearing localStorage and sessionStorage...');

// Clear all localStorage
localStorage.clear();

// Clear all sessionStorage
sessionStorage.clear();

// Specifically clear auth-related items (in case clear() doesn't work)
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('authToken');

console.log('Storage cleared! Please refresh the page.');

// Optionally reload the page
// window.location.reload();
