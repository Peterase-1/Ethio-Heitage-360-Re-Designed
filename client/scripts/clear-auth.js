// Utility script to clear authentication localStorage data
// This can be run in the browser console or as a node script

function clearAuthData() {
  if (typeof localStorage !== 'undefined') {
    console.log('🧹 Clearing authentication localStorage data...');
    
    // Remove all authentication-related items
    const authKeys = [
      'token',
      'refreshToken', 
      'user',
      'lastLogin',
      'enrolledCourses',
      'authExpiry'
    ];
    
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Removing ${key}...`);
        localStorage.removeItem(key);
      }
    });
    
    // Also clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const sessionKeys = ['redirectAfterLogin'];
      sessionKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          console.log(`🗑️ Removing sessionStorage ${key}...`);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('✅ Authentication data cleared successfully!');
    console.log('🔄 Please refresh the page to restart the application.');
    
    return true;
  } else {
    console.error('❌ localStorage not available');
    return false;
  }
}

// Auto-execute if running in browser
if (typeof window !== 'undefined') {
  clearAuthData();
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = clearAuthData;
}
