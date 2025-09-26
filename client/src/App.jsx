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
import RentalManagement from './components/museum/RentalManagement'
import OrganizerDashboard from './pages/OrganizerDashboard'
import VisitorDashboard from './pages/VisitorDashboard'
import UserTourPage from './pages/UserTourPage'
import UserProfile from './pages/UserProfile'
import Courses from './pages/Courses'
import EducationalTours from './pages/EducationalTours'
import AdminSupport from './pages/AdminSupport';
import Support from './pages/Support';
import StudyGuides from './pages/StudyGuides'
import EducationHub from './pages/EducationHub'
// Visitor specific pages
import VisitorVirtualMuseum from './pages/visitor/VirtualMuseum'
import StudyGroups from './pages/visitor/StudyGroups'
import ProfileSettings from './pages/visitor/ProfileSettings';
import MyLearning from './pages/visitor/MyLearning';
import Certificates from './pages/visitor/Certificates';
import Bookmarks from './pages/visitor/Bookmarks';
import Notes from './pages/visitor/Notes';
import Social from './pages/visitor/Social';
import Community from './pages/visitor/Community';
import Analytics from './pages/visitor/Analytics';
import Tools from './pages/visitor/Tools';
// New visitor analytics sub-pages
import Achievements from './pages/visitor/Achievements';
import Activity from './pages/visitor/Activity';
import Goals from './pages/visitor/Goals';
// Community pages
import Leaderboard from './pages/visitor/Leaderboard';
import CommunityLeaderboard from './pages/visitor/CommunityLeaderboard';
// Virtual Museum pages
import Gallery from './pages/visitor/Gallery';
// Learning pages
import Flashcards from './pages/visitor/Flashcards';
// Enhanced Progress and Games
import EnhancedProgress from './pages/visitor/EnhancedProgress';
import Games from './pages/visitor/Games';
import Collections from './pages/visitor/Collections';
// Tools & Resources pages
import LanguageGuide from './pages/visitor/LanguageGuide';
import CulturalCalendar from './pages/visitor/CulturalCalendar';
import ConverterTools from './pages/visitor/ConverterTools';
import MobileApp from './pages/visitor/MobileApp';
// Museum Admin components
import MuseumProfile from './components/museum/MuseumProfile'
import ArtifactManagement from './components/museum/ArtifactManagement'
import VirtualMuseumManagement from './components/museum/VirtualMuseumManagement'
import StaffManagement from './components/museum/StaffManagement'
import EventManagement from './components/museum/EventManagement'
import MuseumAnalytics from './components/museum/MuseumAnalytics'
import MuseumNotifications from './components/museum/MuseumNotifications'
import MuseumCommunications from './components/museum/MuseumCommunications'
import MuseumSettings from './components/museum/MuseumSettings'
// Super Admin components
import SuperAdminGamesManagement from './components/admin/SuperAdminGamesManagement'
import SuperAdminToolsManagement from './components/admin/SuperAdminToolsManagement'
import SuperAdminProgressManagement from './components/admin/SuperAdminProgressManagement'
import SuperAdminStudentManagement from './components/admin/SuperAdminStudentManagement'
import RoleBasedRoute from './components/auth/RoleBasedRoute'
import { useAuth } from './hooks/useAuth'
import EnhancedChatbot from './components/chat/EnhancedChatbot'
import './styles/global.css'
import { DashboardProvider } from './context/DashboardContext'

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

    if (allowedRoles) {
      // Check if user role is allowed (support both backend and frontend role names)
      const hasAccess = allowedRoles.some(allowedRole => {
        // Direct match
        if (allowedRole === user.role) return true;

        // Handle backend to frontend role mapping
        const roleMap = {
          'superAdmin': ['super_admin', 'superAdmin'],
          'museumAdmin': ['museum_admin', 'museumAdmin', 'museum'],
          'user': ['visitor', 'user'],
          // Reverse mapping for frontend to backend
          'super_admin': ['superAdmin', 'super_admin'],
          'museum_admin': ['museumAdmin', 'museum_admin', 'museum'],
          'museum': ['museumAdmin', 'museum_admin', 'museum'],
          'visitor': ['user', 'visitor']
        };

        const mappedRoles = roleMap[allowedRole] || [];
        return mappedRoles.includes(user.role);
      });

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on user role (using backend role names)
        const redirectRoutes = {
          superAdmin: '/super-admin',       // Backend uses 'superAdmin'
          admin: '/admin',
          museumAdmin: '/museum-dashboard', // Backend uses 'museumAdmin'
          organizer: '/organizer-dashboard',
          user: '/visitor-dashboard'        // Backend uses 'user' for visitors
        }

        const redirectTo = redirectRoutes[user.role] || '/'
        return <Navigate to={redirectTo} replace />
      }
    }

    return children
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <DashboardProvider>

        <Routes>
          <Route path="/" element={
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/auth" element={<Auth darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
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
              <UserTourPage />
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
          {/* Educational Routes - Consolidated */}
          <Route path="/education" element={
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <EducationHub />
              <Footer />
            </>
          } />
          {/* Redirect old routes to main education hub */}
          <Route path="/courses" element={<Navigate to="/education" replace />} />
          <Route path="/education-hub" element={<Navigate to="/education" replace />} />
          {/* Redirect old learning route to education */}
          <Route path="/learning" element={<Navigate to="/education" replace />} />
          <Route path="/educational-tours" element={
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <EducationalTours />
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
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
              <SuperAdminDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />

          {/* Museum Admin Routes */}
          <Route path="/museum-dashboard/profile/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumProfile />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/artifacts/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <ArtifactManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/virtual-museum/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <VirtualMuseumManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/staff/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <StaffManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/events/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <EventManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/rentals/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <RentalManagement />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/analytics/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/notifications" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumNotifications />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/communications/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumCommunications />
            </ProtectedRoute>
          } />
          <Route path="/museum-dashboard/settings/*" element={
            <ProtectedRoute allowedRoles={['museumAdmin']}>
              <MuseumSettings />
            </ProtectedRoute>
          } />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin/games" element={
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
              <SuperAdminGamesManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/tools" element={
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
              <SuperAdminToolsManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/progress" element={
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
              <SuperAdminProgressManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/student-management" element={
            <ProtectedRoute allowedRoles={['superAdmin', 'admin']}>
              <SuperAdminStudentManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />
          <Route path="/visitor-dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <VisitorDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          } />

          {/* Visitor-specific routes */}
          <Route path="/visitor/virtual-museum" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/virtual-museum/*" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/profile" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <ProfileSettings />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/preferences" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <ProfileSettings />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/my-learning" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <MyLearning />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/certificates" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Certificates />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/education" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <MyLearning />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/learning" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Interactive Learning Hub</h2>
                  <p className="text-gray-600">Coming soon! Interactive quizzes, games, and live learning sessions.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/quiz" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Games />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/games" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Games />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/live-sessions" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Live Learning Sessions</h2>
                  <p className="text-gray-600">Join live educational sessions with expert instructors.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/progress" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <EnhancedProgress />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/events" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Events & Exhibitions</h2>
                  <p className="text-gray-600">Coming soon! Browse upcoming events and exhibitions.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/favorites" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">My Favorites</h2>
                  <p className="text-gray-600">Coming soon! Manage your favorite artifacts and museums.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/heritage-sites" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Heritage Sites</h2>
                  <p className="text-gray-600">Coming soon! Explore Ethiopian heritage locations.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />

          {/* Visitor Dashboard Enhanced Features */}
          <Route path="/visitor/bookmarks" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Bookmarks />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/notes" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Notes />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/social" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Social />
            </RoleBasedRoute>
          } />

          {/* Main Sidebar Section Routes */}
          <Route path="/visitor/community" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Community />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/analytics" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Analytics />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/tools" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Tools />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/collection" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Collections />
            </RoleBasedRoute>
          } />

          {/* Analytics Sub-pages */}
          <Route path="/visitor/achievements" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Achievements />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/activity" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Activity />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/stats" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Analytics />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/goals" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Goals />
            </RoleBasedRoute>
          } />

          {/* Community Sub-pages */}
          <Route path="/visitor/forums" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Community />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/study-groups" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Community />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/groups" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <StudyGroups />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/leaderboard" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <CommunityLeaderboard />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/share-progress" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Social />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/find-friends" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Social />
            </RoleBasedRoute>
          } />

          {/* Virtual Museum Sub-pages */}
          <Route path="/visitor/3d-artifacts" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/gallery" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Gallery />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/videos" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/audio" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorVirtualMuseum />
            </RoleBasedRoute>
          } />

          {/* Learning Sub-pages */}
          <Route path="/visitor/flashcards" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <Flashcards />
            </RoleBasedRoute>
          } />

          {/* Events Sub-pages */}
          <Route path="/visitor/exhibitions" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Exhibitions</h2>
                  <p className="text-gray-600">Coming soon! Browse current and upcoming exhibitions.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/workshops" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Workshops</h2>
                  <p className="text-gray-600">Coming soon! Join educational workshops and hands-on activities.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/bookings" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
                  <p className="text-gray-600">View and manage your event and tour bookings.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/visitor/calendar" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Event Calendar</h2>
                  <p className="text-gray-600">View upcoming events in calendar format.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />

          {/* Collection Sub-pages */}
          <Route path="/visitor/downloads" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Downloads</h2>
                  <p className="text-gray-600">Access your downloaded content and resources.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />

          {/* Settings Sub-pages */}
          <Route path="/visitor/notifications" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
                  <p className="text-gray-600">Manage your notification preferences.</p>
                </div>
              </div>
            </RoleBasedRoute>
          } />

          {/* Tools & Resources Sub-pages */}
          <Route path="/visitor/dashboard-tool" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <VisitorDashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/language" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <LanguageGuide />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/cultural-calendar" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <CulturalCalendar />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/converters" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <ConverterTools />
            </RoleBasedRoute>
          } />
          <Route path="/visitor/mobile" element={
            <RoleBasedRoute allowedRoles={['user']}>
              <MobileApp />
            </RoleBasedRoute>
          } />

          {/* New Educational Routes */}
          <Route path="/support" element={
            <Support darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          } />
          <Route path="/study-guides" element={
            <StudyGuides darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          } />
          <Route path="/admin-support" element={
            <ProtectedRoute allowedRoles={['admin', 'superAdmin']}>
              <AdminSupport darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
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

        {/* Global Enhanced Chatbot - Available on all pages */}
        <EnhancedChatbot />

      </DashboardProvider>
    </div>
  )
}

export default App
