import React from 'react';
import { Users, Building2, MapPin, User } from 'lucide-react';
import { cn } from '../ui/utils';

const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    {
      id: 'visitor',
      title: 'Visitor',
      description: 'Explore heritage sites and virtual museums',
      icon: User,
      activeClass: 'border-primary bg-primary/10',
      iconClass: 'text-primary',
      iconBgClass: 'bg-primary/20',
      textClass: 'text-foreground',
      descClass: 'text-muted-foreground',
      indicatorClass: 'bg-primary'
    },
    {
      id: 'museum',
      title: 'Museum Administrator',
      description: 'Manage museum collections and exhibits',
      icon: Building2,
      activeClass: 'border-emerald-500 bg-emerald-500/10',
      iconClass: 'text-emerald-600',
      iconBgClass: 'bg-emerald-500/20',
      textClass: 'text-foreground',
      descClass: 'text-emerald-700/80',
      indicatorClass: 'bg-emerald-500'
    },
    {
      id: 'organizer',
      title: 'Tour Organizer',
      description: 'Create and manage heritage tours',
      icon: MapPin,
      activeClass: 'border-purple-500 bg-purple-500/10',
      iconClass: 'text-purple-600',
      iconBgClass: 'bg-purple-500/20',
      textClass: 'text-foreground',
      descClass: 'text-purple-700/80',
      indicatorClass: 'bg-purple-500'
    },
    {
      id: 'admin',
      title: 'System Administrator',
      description: 'Manage the entire platform',
      icon: Users,
      activeClass: 'border-destructive bg-destructive/10',
      iconClass: 'text-destructive',
      iconBgClass: 'bg-destructive/20',
      textClass: 'text-foreground',
      descClass: 'text-destructive/80',
      indicatorClass: 'bg-destructive'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden",
                isSelected
                  ? role.activeClass
                  : "border-border hover:border-muted-foreground/20 bg-card hover:bg-accent/5"
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isSelected ? role.iconBgClass : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-6 w-6",
                    isSelected ? role.iconClass : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <h4 className={cn(
                    "font-medium",
                    "text-foreground"
                  )}>
                    {role.title}
                  </h4>
                  <p className={cn(
                    "text-sm mt-1",
                    isSelected ? role.descClass : "text-muted-foreground"
                  )}>
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    role.indicatorClass
                  )}>
                    <div className="w-2 h-2 bg-background rounded-full"></div>
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