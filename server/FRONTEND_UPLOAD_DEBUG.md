# 🔧 Frontend Upload Button Not Working - Debug Guide

## 🚨 Current Issues
1. **Source Map Error**: JavaScript error in frontend causing functionality to break
2. **Upload Button Not Responding**: Click events not working properly
3. **Museum Dashboard Upload**: Specific issue with museum logo upload

## 🔍 Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Look for JavaScript errors (red text)
4. Share any error messages you see

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Click the upload button
3. See if any HTTP requests are made
4. Check if authentication token is being sent

### Step 3: Verify Authentication
Let's test if you're properly logged in:

```javascript
// Open browser console and run this:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
```

### Step 4: Test Upload Function Manually
Run this in browser console to test the upload:

```javascript
// Test upload function manually
async function testUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = localStorage.getItem('token');
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    try {
      const response = await fetch('http://localhost:5000/api/museums/profile/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      if (!response.ok) {
        console.error('Upload failed:', result);
      } else {
        console.log('Upload successful!');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  input.click();
}

// Run the test
testUpload();
```

## 🛠️ Common Fixes

### Fix 1: Clear Browser Cache
1. **Hard Refresh**: Ctrl + Shift + R
2. **Clear Cache**: 
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data

### Fix 2: Check Vite Configuration
The source map error suggests a Vite build issue. Try:

```bash
# In your client directory
cd client
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Fix 3: Disable Source Maps Temporarily
In your `vite.config.js`, add:

```javascript
export default {
  // ... other config
  build: {
    sourcemap: false
  }
}
```

### Fix 4: Check CORS Headers
Ensure your backend is running and accessible:

```bash
# Test backend health
curl http://localhost:5000/api/health
```

## 🎯 Specific Frontend Upload Component Fix

If your upload component looks something like this, here's the corrected version:

```javascript
import React, { useState } from 'react';

const MuseumLogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [logo, setLogo] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('File selected:', file.name);
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = localStorage.getItem('token');
    
    try {
      console.log('Uploading to:', 'http://localhost:5000/api/museums/profile/logo');
      
      const response = await fetch('http://localhost:5000/api/museums/profile/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('Upload response:', result);
      
      if (response.ok) {
        setLogo(result.data.logo.url);
        alert('Logo uploaded successfully!');
      } else {
        console.error('Upload failed:', result);
        alert(`Upload failed: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="logo-preview">
        {logo ? (
          <img src={logo} alt="Museum Logo" className="logo-image" />
        ) : (
          <div className="logo-placeholder">
            <span>No logo uploaded</span>
          </div>
        )}
      </div>
      
      <label htmlFor="logo-upload" className="upload-button">
        {uploading ? 'Uploading...' : 'Upload Logo'}
        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default MuseumLogoUpload;
```

## 🔄 Quick Test Commands

Run these in your terminal to test the backend:

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Test auth endpoint
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test if upload endpoint exists
curl -X POST http://localhost:5000/api/museums/profile/logo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚨 Emergency Frontend Reset

If nothing works, try this:

```bash
# Stop all servers
# Kill port 5173 and 5000

# Client reset
cd client
rm -rf node_modules dist .vite
npm install
npm run dev

# Server reset (in new terminal)
cd server
npm run dev
```

## 💡 What to Share for Further Help

Please share:
1. **Console errors** (exact error messages)
2. **Network tab** screenshot when clicking upload
3. **Your upload component code** (the React component)
4. **Authentication status** (token exists? user logged in?)

---

**Next Action**: Try the manual upload test in Step 4 first - this will tell us exactly what's wrong!
