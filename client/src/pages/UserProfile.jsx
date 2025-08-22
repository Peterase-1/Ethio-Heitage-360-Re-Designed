import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import { 
  User, Mail, Phone, MapPin, Camera, Save, Edit3, 
  Globe, Heart, Star, Calendar, Ticket, Package, 
  DollarSign, Eye, MessageSquare, Clock, 
  CheckCircle, XCircle, AlertTriangle, Search, 
  Filter, Navigation, Play, Volume2, Home,
  ChevronDown, ChevronUp, Bookmark
} from 'lucide-react'

const UserProfile = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isEditing, setIsEditing] = useState(false)
  
  // State for different sections
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    favorites: [],
    bookingHistory: [],
    reviews: [],
    loading: false,
    error: ''
  })
  
  const [virtualExhibits, setVirtualExhibits] = useState({
    items: [],
    searchTerm: '',
    categoryFilter: '',
    museumFilter: '',
    loading: false,
    error: ''
  })
  
  const [heritageSites, setHeritageSites] = useState({
    items: [],
    searchTerm: '',
    regionFilter: '',
    loading: false,
    error: ''
  })
  
  const [bookings, setBookings] = useState({
    items: [],
    upcoming: [],
    past: [],
    loading: false,
    error: ''
  })
  
  const [events, setEvents] = useState({
    upcoming: [],
    searchTerm: '',
    dateFilter: '',
    loading: false,
    error: ''
  })
  
  const [artifacts, setArtifacts] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    searchTerm: '',
    category: '',
    museum: '',
    loading: false,
    error: ''
  })
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profile: {
      bio: '',
      phone: '',
      avatar: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      preferences: {
        language: 'en',
        favoriteCategories: [],
        notifications: {
          email: true,
          push: true
        },
        interests: []
      }
    }
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profile: {
          bio: user.profile?.bio || '',
          phone: user.profile?.phone || '',
          avatar: user.profile?.avatar || '',
          address: {
            street: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            state: user.profile?.address?.state || '',
            country: user.profile?.address?.country || '',
            zipCode: user.profile?.address?.zipCode || ''
          },
          preferences: {
            language: user.profile?.preferences?.language || 'en',
            notifications: {
              email: user.profile?.preferences?.notifications?.email ?? true,
              push: user.profile?.preferences?.notifications?.push ?? true
            },
            interests: user.profile?.preferences?.interests || []
          }
        }
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const keys = name.split('.')
      setFormData(prev => {
        const newData = { ...prev }
        let current = newData
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {}
          current = current[keys[i]]
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value
        return newData
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleInterestChange = (interest) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferences: {
          ...prev.profile.preferences,
          interests: prev.profile.preferences.interests.includes(interest)
            ? prev.profile.preferences.interests.filter(i => i !== interest)
            : [...prev.profile.preferences.interests, interest]
        }
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    setMessage('')

    try {
      await api.request('/auth/profile', {
        method: 'PUT',
        body: formData
      })
      
      setMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      setMessage('Error updating profile: ' + error.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const availableInterests = [
    'history', 'art', 'culture', 'archaeology', 
    'architecture', 'religion', 'music', 'literature'
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'አማርኛ (Amharic)' },
    { code: 'or', name: 'Afaan Oromoo (Oromo)' },
    { code: 'ti', name: 'ትግርኛ (Tigrinya)' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    {formData.profile.avatar ? (
                      <img 
                        src={formData.profile.avatar} 
                        alt="Profile" 
                        className="w-18 h-18 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{formData.name}</h1>
                  <p className="text-blue-100 capitalize">{user?.role?.replace('_', ' ')}</p>
                  <p className="text-blue-100">{formData.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700 border border-red-300' 
                  : 'bg-green-100 text-green-700 border border-green-300'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="profile.phone"
                    value={formData.profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language Preference
                  </label>
                  <select
                    name="profile.preferences.language"
                    value={formData.profile.preferences.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="profile.bio"
                  value={formData.profile.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="profile.address.street"
                      value={formData.profile.address.street}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Street Address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <input
                    type="text"
                    name="profile.address.city"
                    value={formData.profile.address.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    name="profile.address.state"
                    value={formData.profile.address.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="State/Region"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    name="profile.address.country"
                    value={formData.profile.address.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <input
                    type="text"
                    name="profile.address.zipCode"
                    value={formData.profile.address.zipCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="ZIP Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Interests
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableInterests.map(interest => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.profile.preferences.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 capitalize">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="profile.preferences.notifications.email"
                      checked={formData.profile.preferences.notifications.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="profile.preferences.notifications.push"
                      checked={formData.profile.preferences.notifications.push}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">Push Notifications</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile