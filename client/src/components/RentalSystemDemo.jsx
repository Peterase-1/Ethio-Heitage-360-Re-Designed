import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import RentalRequestManager from './RentalRequestManager';
import MuseumRentalManager from './MuseumRentalManager';
import { Building, Shield, Switch, User } from 'lucide-react';

const RentalSystemDemo = () => {
  const { user } = useContext(AuthContext);
  const [demoRole, setDemoRole] = useState(user?.role || 'superAdmin');

  // Mock user data for demonstration
  const mockUsers = {
    superAdmin: {
      id: 1,
      email: 'superadmin@museum.gov',
      name: 'Super Administrator',
      role: 'superAdmin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin'
    },
    museumAdmin: {
      id: 2,
      email: 'admin@nationalmuseum.et',
      name: 'Museum Administrator',
      role: 'museumAdmin',
      museumId: '507f1f77bcf86cd799439011',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=museumadmin'
    }
  };

  const currentUser = mockUsers[demoRole];

  // Create a mock AuthContext value for the demo
  const mockAuthContext = {
    user: currentUser,
    isLoading: false,
    login: async () => ({ success: true }),
    logout: () => {},
    signup: async () => ({ success: true })
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Museum Rental System Demo</h1>
              <p className="text-sm text-gray-500">
                Demonstrating both Super Admin and Museum Admin interfaces
              </p>
            </div>
            
            {/* Role Switcher */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Current Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  demoRole === 'superAdmin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {demoRole === 'superAdmin' ? 'Super Admin' : 'Museum Admin'}
                </span>
              </div>
              
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setDemoRole('superAdmin')}
                  className={`px-3 py-2 text-sm font-medium flex items-center space-x-2 ${
                    demoRole === 'superAdmin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Super Admin</span>
                </button>
                <button
                  onClick={() => setDemoRole('museumAdmin')}
                  className={`px-3 py-2 text-sm font-medium flex items-center space-x-2 ${
                    demoRole === 'museumAdmin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>Museum Admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current User Info */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentUser.name}</h3>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {demoRole === 'superAdmin' ? (
                  <>
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-600">Super Administrator</span>
                    <span className="text-xs text-gray-400">• Can approve museum requests</span>
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Museum Administrator</span>
                    <span className="text-xs text-gray-400">• Can create rental requests to Super Admin</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Description */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How the Rental System Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Museum Admin Interface</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Submit rental requests to Super Admin</li>
                <li>• View request status updates</li>
                <li>• Manage museum's artifact rentals</li>
                <li>• Track approval progress</li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Super Admin Interface</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Review all rental requests</li>
                <li>• Approve or reject museum requests</li>
                <li>• Create requests to museums</li>
                <li>• Manage system-wide rentals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Render the appropriate component based on role */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AuthContext.Provider value={mockAuthContext}>
            {demoRole === 'superAdmin' ? (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Super Admin Rental Management</h2>
                </div>
                <RentalRequestManager />
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Building className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Museum Admin Rental Management</h2>
                </div>
                <MuseumRentalManager />
              </div>
            )}
          </AuthContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default RentalSystemDemo;
