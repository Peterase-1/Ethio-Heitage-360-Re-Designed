import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    language: 'English',
    phone: '',
    bio: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Load current user profile data
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.firstName || '',
        email: user.email || '',
        language: user.language || 'English',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔄 Updating profile with data:', profile);
      const response = await api.updateUserProfile(profile);
      console.log('✅ Profile update response:', response);
      
      // Check if response indicates success (different APIs may return different structures)
      if (response.success || response.message === 'Profile updated successfully') {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        setIsEditing(false);
        
        // Update localStorage user data to reflect changes
        const updatedUser = { ...user, ...profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: response.message || 'Failed to update profile' 
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'An error occurred while updating your profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setProfile({
        name: user.name || user.firstName || '',
        email: user.email || '',
        language: user.language || 'English',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || ''
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-amber-700 mr-3" />
            <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
          </div>
          <p className="text-lg text-amber-800">
            Manage your account preferences and personal information
          </p>
        </div>
        
        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-300' 
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}
        
        <div className="bg-amber-50 p-8 rounded-lg shadow-lg border border-amber-200">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-black">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-black transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isEditing 
                        ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                        : 'border-amber-300 bg-amber-25 text-amber-900'
                    }`}
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isEditing 
                        ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                        : 'border-amber-300 bg-amber-25 text-amber-900'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isEditing 
                        ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                        : 'border-amber-300 bg-amber-25 text-amber-900'
                    }`}
                    placeholder="+251 912 345 678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Language Preference
                  </label>
                  <select 
                    name="language"
                    value={profile.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isEditing 
                        ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                        : 'border-amber-300 bg-amber-25 text-amber-900'
                    }`}
                  >
                    <option value="English">English</option>
                    <option value="Amharic">አማርኛ (Amharic)</option>
                    <option value="Oromo">Afaan Oromoo (Oromo)</option>
                    <option value="Tigrinya">ትግርኛ (Tigrinya)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      isEditing 
                        ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                        : 'border-amber-300 bg-amber-25 text-amber-900'
                    }`}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md transition-colors resize-none ${
                    isEditing 
                      ? 'border-amber-600 bg-white text-black focus:border-black focus:ring-amber-700' 
                      : 'border-amber-300 bg-amber-25 text-amber-900'
                  }`}
                  placeholder="Tell us a bit about yourself and your interests in Ethiopian heritage..."
                />
              </div>
              
              {isEditing && (
                <div className="flex space-x-4 pt-6 border-t border-amber-300">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-amber-800 text-white rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-amber-600 text-amber-800 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Account Information */}
        <div className="bg-amber-50 p-8 rounded-lg shadow-lg border border-amber-200 mt-6">
          <h2 className="text-2xl font-semibold text-black mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="block text-amber-700 mb-1 font-medium">Account Type</label>
              <p className="text-black font-semibold capitalize">
                {user?.role === 'user' ? 'Visitor' : user?.role || 'Visitor'}
              </p>
            </div>
            <div>
              <label className="block text-amber-700 mb-1 font-medium">Member Since</label>
              <p className="text-black font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-amber-700 mb-1 font-medium">User ID</label>
              <p className="text-black font-semibold font-mono text-xs">
                {user?.id || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-amber-700 mb-1 font-medium">Last Login</label>
              <p className="text-black font-semibold">
                {localStorage.getItem('lastLogin') 
                  ? new Date(localStorage.getItem('lastLogin')).toLocaleString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
