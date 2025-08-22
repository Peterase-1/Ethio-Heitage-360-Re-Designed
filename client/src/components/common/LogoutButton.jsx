import React, { useState } from 'react';
import { LogOut, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton = ({ 
  className = "", 
  variant = "button", // "button", "dropdown", "sidebar"
  showText = true,
  showConfirmModal = true,
  onLogoutStart,
  onLogoutComplete
}) => {
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmModal) {
      setShowModal(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowModal(false);
    
    try {
      if (onLogoutStart) {
        onLogoutStart();
      }
      
      await logout();
      
      if (onLogoutComplete) {
        onLogoutComplete();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const baseButtonClasses = "flex items-center justify-center gap-2 transition-colors duration-200";
  
  const variantClasses = {
    button: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50",
    dropdown: "w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 hover:text-red-700",
    sidebar: "w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  };

  const buttonContent = (
    <>
      {isLoggingOut ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {showText && (
        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
      )}
    </>
  );

  return (
    <>
      <button
        onClick={handleLogoutClick}
        disabled={isLoggingOut}
        className={`${baseButtonClasses} ${variantClasses[variant]} ${className}`}
        title={`Logout ${user?.name || user?.email || 'user'}`}
      >
        {buttonContent}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out? You'll need to sign in again to access your dashboard.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutButton;
