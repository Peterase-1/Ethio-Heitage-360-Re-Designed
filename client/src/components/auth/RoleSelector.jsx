import React from 'react';
import { Users, Building2, MapPin, User } from 'lucide-react';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      id: 'visitor',
      title: 'Visitor',
      description: 'Explore heritage sites and virtual museums',
      icon: User,
      color: 'blue'
    },
    {
      id: 'museum',
      title: 'Museum Administrator',
      description: 'Manage museum collections and exhibits',
      icon: Building2,
      color: 'green'
    },
    {
      id: 'organizer',
      title: 'Tour Organizer',
      description: 'Create and manage heritage tours',
      icon: MapPin,
      color: 'purple'
    },
    {
      id: 'admin',
      title: 'System Administrator',
      description: 'Manage the entire platform',
      icon: Users,
      color: 'red'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? `border-${role.color}-500 bg-${role.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? `bg-${role.color}-100` : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isSelected ? `text-${role.color}-600` : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isSelected ? `text-${role.color}-900` : 'text-gray-900'
                  }`}>
                    {role.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    isSelected ? `text-${role.color}-700` : 'text-gray-600'
                  }`}>
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className={`w-5 h-5 rounded-full bg-${role.color}-500 flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;