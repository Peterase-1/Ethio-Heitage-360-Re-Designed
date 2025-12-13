// Simple toast implementation
export const toast = {
  success: (message) => {
    console.log('✅', message);
    // In a real app, you'd use a proper toast library
  },
  error: (message) => {
    console.error('❌', message);
    // In a real app, you'd use a proper toast library
  },
  info: (message) => {
    console.log('ℹ️', message);
    // In a real app, you'd use a proper toast library
  }
};

