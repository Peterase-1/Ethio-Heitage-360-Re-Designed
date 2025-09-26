import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  Smartphone,
  Download,
  Star,
  Shield,
  Wifi,
  Camera,
  Map,
  Book,
  Play,
  Users,
  Share2,
  QrCode,
  Apple,
  Chrome,
  Monitor,
  Tablet,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Globe,
  Bell,
  Heart,
  Zap,
  Award,
  Clock,
  Languages,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const MobileApp = () => {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState('android');
  const [showQRCode, setShowQRCode] = useState(false);

  const appFeatures = [
    {
      icon: Camera,
      title: 'AR Artifact Viewer',
      description: 'View 3D models of Ethiopian artifacts in augmented reality',
      category: 'Innovation'
    },
    {
      icon: Map,
      title: 'Offline Heritage Map',
      description: 'Access heritage sites and museum locations even without internet',
      category: 'Navigation'
    },
    {
      icon: Book,
      title: 'Offline Learning',
      description: 'Download courses and study materials for offline access',
      category: 'Education'
    },
    {
      icon: Languages,
      title: 'Amharic Language Pack',
      description: 'Complete Amharic learning modules with audio pronunciation',
      category: 'Language'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get alerts for nearby heritage sites and cultural events',
      category: 'Engagement'
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Connect with other heritage enthusiasts and share experiences',
      category: 'Social'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges and certificates for completing learning milestones',
      category: 'Gamification'
    },
    {
      icon: Zap,
      title: 'Fast Sync',
      description: 'Seamlessly sync progress between mobile and web platforms',
      category: 'Performance'
    }
  ];

  const appVersions = {
    android: {
      name: 'Android',
      icon: Smartphone,
      version: '2.1.3',
      size: '45 MB',
      rating: 4.8,
      reviews: 2156,
      requirements: 'Android 8.0+',
      downloadUrl: '#',
      features: ['Google Play Services', 'AR Core Support', 'Offline Mode', 'Push Notifications']
    },
    ios: {
      name: 'iOS',
      icon: Apple,
      version: '2.1.1',
      size: '52 MB',
      rating: 4.9,
      reviews: 1847,
      requirements: 'iOS 13.0+',
      downloadUrl: '#',
      features: ['ARKit Support', 'Siri Shortcuts', 'Widget Support', 'iCloud Sync']
    },
    pwa: {
      name: 'Web App',
      icon: Globe,
      version: '2.1.3',
      size: '12 MB',
      rating: 4.7,
      reviews: 892,
      requirements: 'Modern Browser',
      downloadUrl: '#',
      features: ['Works Offline', 'Push Notifications', 'Home Screen Install', 'Cross Platform']
    }
  };

  const screenshots = [
    {
      title: 'Heritage Dashboard',
      description: 'Your personalized learning dashboard with progress tracking',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop'
    },
    {
      title: 'AR Artifact View',
      description: '3D augmented reality view of historical artifacts',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=600&fit=crop'
    },
    {
      title: 'Interactive Map',
      description: 'Explore Ethiopian heritage sites with offline support',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=600&fit=crop'
    },
    {
      title: 'Learning Modules',
      description: 'Access courses and educational content on the go',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=600&fit=crop'
    }
  ];

  const handleDownload = (platform) => {
    // In a real app, these would be actual download links
    toast.success(`Redirecting to ${appVersions[platform].name} download...`);
    // window.open(appVersions[platform].downloadUrl, '_blank');
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Heritage 360 Mobile App',
        text: 'Discover Ethiopian heritage with AR, offline learning, and interactive maps!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('App link copied to clipboard!');
    }
  };

  const selectedApp = appVersions[selectedPlatform];
  const PlatformIcon = selectedApp.icon;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Heritage 360 Mobile App</h1>
                  <p className="text-gray-600 mt-1">Experience Ethiopian heritage on the go with AR, offline learning, and more</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={shareApp}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </button>
              </div>
            </div>

            {/* App Overview Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Downloads</span>
                </div>
                <p className="text-3xl font-bold text-green-600">50K+</p>
                <p className="text-sm text-gray-500">Active installs</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Rating</span>
                </div>
                <p className="text-3xl font-bold text-yellow-500">4.8</p>
                <p className="text-sm text-gray-500">Average rating</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Security</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-gray-500">Safe & secure</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-2">
                  <Wifi className="h-6 w-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Offline</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">YES</p>
                <p className="text-sm text-gray-500">Works offline</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Platform Selection & Download */}
            <div className="col-span-4">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Choose Your Platform</h3>
                
                {/* Platform Buttons */}
                <div className="space-y-3 mb-6">
                  {Object.entries(appVersions).map(([key, app]) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPlatform(key)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          selectedPlatform === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{app.name}</p>
                          <p className="text-sm text-gray-500">v{app.version} • {app.size}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{app.rating}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Platform Details */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PlatformIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedApp.name}</h4>
                      <p className="text-sm text-gray-500">Version {selectedApp.version}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{selectedApp.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requirements:</span>
                      <span className="font-medium">{selectedApp.requirements}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reviews:</span>
                      <span className="font-medium">{selectedApp.reviews.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Platform Features */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-2">Platform Features:</h5>
                    <div className="space-y-1">
                      {selectedApp.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(selectedPlatform)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                  >
                    <Download className="h-5 w-5" />
                    Download for {selectedApp.name}
                  </button>

                  {/* Alternative Download Link */}
                  <button
                    className="w-full mt-2 py-2 px-4 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={() => toast.info('Alternative download methods coming soon!')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      Alternative download
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-8 space-y-8">
              {/* Screenshots */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">App Screenshots</h3>
                <div className="grid grid-cols-4 gap-4">
                  {screenshots.map((screenshot, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-[9/16] mb-2">
                        <img
                          src={screenshot.image}
                          alt={screenshot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="600" viewBox="0 0 300 600"><rect width="300" height="600" fill="%23f3f4f6"/><text x="150" y="300" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280">${screenshot.title}</text></svg>`;
                          }}
                        />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900">{screenshot.title}</h4>
                      <p className="text-xs text-gray-500">{screenshot.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">App Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  {appFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <feature.icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{feature.title}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {feature.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Section */}
              {showQRCode && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Download</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Scan to Download</h4>
                      <p className="text-gray-600 mb-4">Scan this QR code with your phone camera to download the app directly.</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Info className="h-4 w-4" />
                        <span>Works on both Android and iOS devices</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Requirements */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Requirements
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Android</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Android 8.0 or higher</li>
                      <li>• 2GB RAM minimum</li>
                      <li>• 100MB storage space</li>
                      <li>• Camera for AR features</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">iOS</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• iOS 13.0 or later</li>
                      <li>• iPhone 7 or newer</li>
                      <li>• 120MB storage space</li>
                      <li>• ARKit support preferred</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">Web App</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Modern browser</li>
                      <li>• JavaScript enabled</li>
                      <li>• 50MB cache space</li>
                      <li>• HTTPS connection</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Coming Soon</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Voice Assistant</h4>
                      <p className="text-sm text-yellow-700">Audio-guided heritage tours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Live Events</h4>
                      <p className="text-sm text-green-700">Virtual heritage events & workshops</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
