// EMERGENCY FIX: Force port 5000
console.log('🚨 EMERGENCY FIX: Forcing port 5000');

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear any cached API URLs
const keys = Object.keys(localStorage);
keys.forEach(key => {
  if (key.includes('api') || key.includes('url') || key.includes('base')) {
    localStorage.removeItem(key);
  }
});

// Force reload with cache clear
console.log('🔄 Forcing page reload with cache clear...');
window.location.reload(true);

// If that doesn't work, try this:
// window.location.href = window.location.href + '?t=' + Date.now();


