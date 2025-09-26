import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import LanguageSwitcher from './LanguageToggle';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setIsMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/auth';
    
    switch (user.role) {
      case 'superAdmin':
      case 'super_admin':
        return '/super-admin';
      case 'admin':
        return '/admin';
      case 'museumAdmin':
      case 'museum_admin':
      case 'museum':
        return '/museum-dashboard';
      case 'organizer':
        return '/organizer-dashboard';
      case 'user':
      case 'visitor':
      default:
        return '/visitor-dashboard';
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <Logo showText={false} className="w-12 h-12" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/virtual-museum" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                {t('navigation.virtualMuseums')}
              </Link>
              <Link to="/map" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                {t('navigation.heritageMap')}
              </Link>
              <Link to="/tours" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                {t('navigation.liveTours')}
              </Link>
              <Link to="/education" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                {t('navigation.education')}
              </Link>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <LanguageSwitcher />
            
            {/* Show Sign In button if not authenticated */}
            {!isAuthenticated ? (
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t('navigation.signIn')}
              </Link>
            ) : (
              /* Show user menu if authenticated */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-muted text-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name || 'User'}</span>
                </button>
                
                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to={getDashboardRoute()}
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-foreground hover:text-primary p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              <Link to="/virtual-museum" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.virtualMuseums')}
              </Link>
              <Link to="/map" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.heritageMap')}
              </Link>
              <Link to="/tours" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.liveTours')}
              </Link>
              <Link to="/education" className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium" onClick={() => setIsMenuOpen(false)}>
                {t('navigation.education')}
              </Link>
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md text-foreground hover:text-primary hover:bg-muted transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <LanguageSwitcher />
              </div>
              
              {/* Show Sign In button if not authenticated */}
              {!isAuthenticated ? (
                <Link
                  to="/auth"
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors mx-3 block text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.signIn')}
                </Link>
              ) : (
                /* Show user menu if authenticated */
                <div className="space-y-2 px-3">
                  <div className="flex items-center space-x-2 py-2 border-t border-border pt-4">
                    <User className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">{user?.name || 'User'}</span>
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

