import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Common Components
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Public Pages
import Home from '../pages/Home'
import Auth from '../pages/Auth'
import ContactUs from '../pages/ContactUs'
import Map from '../pages/Map'
import Tours from '../pages/Tours'
import VirtualMuseum from '../pages/VirtualMuseum'
import ArtifactDetail from '../pages/ArtifactDetail'

// Dashboards
import AdminDashboard from '../pages/admin/AdminDashboard'
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard'
import MuseumDashboard from '../pages/museum/MuseumDashboard'
import OrganizerDashboard from '../pages/OrganizerDashboard'
import VisitorDashboard from '../pages/visitor/VisitorDashboard'

// Museum sub-modules
import MuseumProfile from '../pages/museum/MuseumProfile'
import ArtifactManagement from '../pages/museum/ArtifactManagement'
import VirtualMuseumManagement from '../pages/museum/VirtualMuseumManagement'
import StaffManagement from '../pages/museum/StaffManagement'
import EventManagement from '../pages/museum/EventManagement'
import RentalManagement from '../pages/museum/RentalManagement'
import MuseumAnalytics from '../pages/museum/MuseumAnalytics'
import MuseumNotifications from '../pages/museum/MuseumNotifications'
import MuseumCommunications from '../pages/museum/MuseumCommunications'
import MuseumSettings from '../pages/museum/MuseumSettings'

// Visitor sub-modules
import VisitorVirtualMuseum from '../pages/visitor/VisitorVirtualMuseum'
import ProfileSettings from '../pages/visitor/ProfileSettings'

// Profile
import UserProfile from '../pages/UserProfile'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const { user, loading } = useAuth()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // ProtectedRoute wrapper
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/auth" replace />
    }

    if (allowedRoles) {
      // Check if user role is allowed (support both backend and frontend role names)
      const hasAccess = allowedRoles.some(allowedRole => {
        // Direct match
        if (allowedRole === user.role) return true;
        
        // Handle backend to frontend role mapping
        const roleMap = {
          'superAdmin': ['super_admin', 'superAdmin'],
          'museumAdmin': ['museum_admin', 'museumAdmin', 'museum'],
          'organizer': ['tour_admin', 'organizer'],
          'user': ['visitor', 'user'],
          // Reverse mapping for frontend to backend
          'super_admin': ['superAdmin', 'super_admin'],
          'museum_admin': ['museumAdmin', 'museum_admin', 'museum'],
          'museum': ['museumAdmin', 'museum_admin', 'museum'],
          'tour_admin': ['organizer', 'tour_admin'],
          'organizer': ['organizer', 'tour_admin'],
          'visitor': ['user', 'visitor']
        };
        
        const mappedRoles = roleMap[allowedRole] || [];
        return mappedRoles.includes(user.role);
      });
      
      if (!hasAccess) {
        const redirectRoutes = {
          // Backend role names
          superAdmin: '/super-admin',
          museumAdmin: '/museum-dashboard',
          user: '/visitor-dashboard',
          // Frontend role names (fallback)
          super_admin: '/super-admin',
          admin: '/admin',
          museum: '/museum-dashboard',
          museum_admin: '/museum-dashboard',
          organizer: '/organizer-dashboard',
          visitor: '/visitor-dashboard'
        }

        const redirectTo = redirectRoutes[user.role] || '/'
        return <Navigate to={redirectTo} replace />
      }
    }

    return children
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/auth" element={<Auth darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/contact" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <ContactUs />
            <Footer />
          </>
        } />
        <Route path="/map" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Map />
            <Footer />
          </>
        } />
        <Route path="/tours" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Tours />
            <Footer />
          </>
        } />
        <Route path="/virtual-museum" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <VirtualMuseum />
            <Footer />
          </>
        } />
        <Route path="/artifact/:id" element={
          <>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <ArtifactDetail />
            <Footer />
          </>
        } />

        {/* Super Admin */}
        <Route path="/super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />

        {/* Museum + Museum Admin */}
        <Route path="/museum-dashboard" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/profile/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumProfile />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/artifacts/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <ArtifactManagement />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/virtual-museum/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <VirtualMuseumManagement />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/staff/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/events/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <EventManagement />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/rentals/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <RentalManagement />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/analytics/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/notifications" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumNotifications />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/communications/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumCommunications />
          </ProtectedRoute>
        } />
        <Route path="/museum-dashboard/settings/*" element={
          <ProtectedRoute allowedRoles={['museum', 'museum_admin']}>
            <MuseumSettings />
          </ProtectedRoute>
        } />

        {/* Organizer */}
        <Route path="/organizer-dashboard" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />

        {/* Visitor */}
        <Route path="/visitor-dashboard" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <VisitorDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </ProtectedRoute>
        } />
        <Route path="/visitor/virtual-museum/*" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <VisitorVirtualMuseum />
          </ProtectedRoute>
        } />
        <Route path="/visitor/profile" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <ProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/visitor/preferences" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <ProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/visitor/events" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Events & Exhibitions</h2>
                <p className="text-gray-600">Coming soon! Browse upcoming events and exhibitions.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/visitor/favorites" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
                <p className="text-gray-600">Coming soon! Manage your favorite artifacts and museums.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/visitor/recent" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
                <p className="text-gray-600">Coming soon! View your browsing history.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/visitor/heritage-sites" element={
          <ProtectedRoute allowedRoles={['visitor']}>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Heritage Sites</h2>
                <p className="text-gray-600">Coming soon! Explore Ethiopian heritage locations.</p>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Profile (all authenticated users) */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['super_admin','admin','museum','museum_admin','organizer','visitor']}>
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <UserProfile />
              <Footer />
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}
