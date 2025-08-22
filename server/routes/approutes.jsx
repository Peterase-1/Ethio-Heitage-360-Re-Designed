import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './utils/i18n' // Initialize i18n
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Auth from './pages/Auth'
import ContactUs from './pages/ContactUs'
import Map from './pages/Map'
import Tours from './pages/Tours'
import VirtualMuseum from './pages/VirtualMuseum'
import ArtifactDetail from './pages/ArtifactDetail'
import AdminDashboard from './pages/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import MuseumDashboard from './pages/MuseumDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import VisitorDashboard from './pages/VisitorDashboard'
import UserProfile from './pages/UserProfile'
// Visitor specific pages
import VisitorVirtualMuseum from './pages/visitor/VirtualMuseum'
import ProfileSettings from './pages/visitor/ProfileSettings'
// Museum Admin components
import MuseumProfile from './components/museum/MuseumProfile'
import ArtifactManagement from './components/museum/ArtifactManagement'
import VirtualMuseumManagement from './components/museum/VirtualMuseumManagement'
import StaffManagement from './components/museum/StaffManagement'
import EventManagement from './components/museum/EventManagement'
import RentalManagement from './components/museum/RentalManagement'
import MuseumAnalytics from './components/museum/MuseumAnalytics'
import MuseumNotifications from './components/museum/MuseumNotifications'
import MuseumCommunications from './components/museum/MuseumCommunications'
import MuseumSettings from './components/museum/MuseumSettings'
import RoleBasedRoute from './components/auth/RoleBasedRoute'
import { useAuth } from './hooks/useAuth'
import './styles/global.css'

function App() {
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

  // Enhanced protected route that redirects based on role
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/auth" replace />
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const redirectRoutes = {
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
    
    return children
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Routes>
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
          
          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <SuperAdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          
          {/* Museum Admin Routes */}
          <Route path="/museum-dashboard/profile/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumProfile />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/artifacts/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <ArtifactManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/virtual-museum/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <VirtualMuseumManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/staff/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <StaffManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/events/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <EventManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/rentals/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <RentalManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/analytics/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/notifications" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumNotifications />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/communications/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumCommunications />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/settings/*" element={
            <ProtectedRoute allowedRoles={['museum']}>
              <MuseumSettings />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/visitor-dashboard" element={
            <ProtectedRoute allowedRoles={['visitor']}>
              <VisitorDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          
          {/* Visitor-specific routes */}
          <Route path="/visitor/virtual-museum" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/virtual-museum/*" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/profile" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <ProfileSettings />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/preferences" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <ProfileSettings />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/events" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Events & Exhibitions</h2>
                  <p className="text-gray-600">Coming soon! Browse upcoming events and exhibitions.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/favorites" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
                  <p className="text-gray-600">Coming soon! Manage your favorite artifacts and museums.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/recent" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
                  <p className="text-gray-600">Coming soon! View your browsing history.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/heritage-sites" element={
            <RoleBasedRoute allowedRoles={['visitor']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Heritage Sites</h2>
                  <p className="text-gray-600">Coming soon! Explore Ethiopian heritage locations.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
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

export default App
