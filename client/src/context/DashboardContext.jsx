import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import apiService from "../services/api";

const DashboardContext = createContext(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  // State
  const [tourPackages, setTourPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Navigation
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");

  // UI State
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);
  const [showBookingRequestsModal, setShowBookingRequestsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current user ID (you might need to adjust this based on your auth implementation)
  const organizerId = currentUser?.id || localStorage.getItem('userId') || '68a39e26bd680dcb7ee5e296'; // Test organizer ID

  // Load initial dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!organizerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getDashboardData(organizerId);
      setDashboardData(data);
      setCurrentUser(data.user);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [organizerId]);

  // Load tour packages
  const loadTourPackages = useCallback(async (params = {}) => {
    if (!organizerId) return;
    
    try {
      const data = await apiService.getTourPackages(organizerId, params);
      setTourPackages(data.tours || []);
      return data;
    } catch (error) {
      console.error('Failed to load tour packages:', error);
      throw error;
    }
  }, [organizerId]);

  // Load bookings
  const loadBookings = useCallback(async (params = {}) => {
    if (!organizerId) return;
    
    try {
      const data = await apiService.getBookings(organizerId, params);
      setBookings(data.bookings || []);
      return data;
    } catch (error) {
      console.error('Failed to load bookings:', error);
      throw error;
    }
  }, [organizerId]);

  // Load messages
  const loadMessages = useCallback(async (params = {}) => {
    if (!organizerId) return;
    
    try {
      const data = await apiService.getMessages(organizerId, params);
      setMessages(data.messages || []);
      return data;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }, [organizerId]);

  // Load activities
  const loadActivities = useCallback(async (page = 1, limit = 10) => {
    if (!organizerId) return;
    
    try {
      const data = await apiService.getActivities(organizerId, page, limit);
      setActivities(data);
      return data;
    } catch (error) {
      console.error('Failed to load activities:', error);
      throw error;
    }
  }, [organizerId]);

  // Load notifications
  const loadNotifications = useCallback(async (unreadOnly = false, limit = 10) => {
    if (!organizerId) return;
    
    try {
      const data = await apiService.getNotifications(organizerId, unreadOnly, limit);
      setNotifications(data);
      return data;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  }, [organizerId]);

  // Create tour package
  const createTourPackage = useCallback(async (tourData) => {
    try {
      const newTour = await apiService.createTourPackage(tourData);
      setTourPackages((prev) => [newTour, ...prev]);
      await loadDashboardData(); // Refresh dashboard stats
      return newTour;
    } catch (error) {
      console.error('Failed to create tour package:', error);
      throw error;
    }
  }, [loadDashboardData]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId, status, reason = '') => {
    try {
      const updatedBooking = await apiService.updateBookingStatus(bookingId, status, reason);
      setBookings((prev) => 
        prev.map((booking) => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );
      await loadDashboardData(); // Refresh dashboard stats
      return updatedBooking;
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw error;
    }
  }, [loadDashboardData]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications((prev) => 
        prev.map((notification) => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      await apiService.markMessageAsRead(messageId);
      setMessages((prev) => 
        prev.map((message) => 
          message.id === messageId 
            ? { ...message, status: 'read' }
            : message
        )
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }, []);

  // Delete tour package
  const deleteTourPackage = useCallback(async (tourId) => {
    try {
      await apiService.deleteTourPackage(tourId);
      setTourPackages((prev) => prev.filter((tour) => tour.id !== tourId));
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to delete tour package:', error);
      throw error;
    }
  }, [loadDashboardData]);

  // Reply to message
  const replyToMessage = useCallback(async (messageId, responseMessage) => {
    try {
      const updatedMessage = await apiService.replyToMessage(messageId, responseMessage);
      setMessages((prev) => 
        prev.map((message) => 
          message.id === messageId ? updatedMessage : message
        )
      );
      return updatedMessage;
    } catch (error) {
      console.error('Failed to reply to message:', error);
      throw error;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (organizerId) {
      loadDashboardData();
    }
  }, [organizerId, loadDashboardData]);

  // Computed values from dashboard data
  const dashboardStats = dashboardData?.stats || {
    totalTours: 0,
    activeTours: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    unreadMessages: 0
  };

  const upcomingTours = dashboardData?.upcomingTours || [];
  const recentActivities = dashboardData?.recentActivities || activities;

  const value = {
    // Data
    tourPackages,
    bookings,
    activities: recentActivities,
    messages,
    notifications,
    currentUser,
    dashboardData,

    // Navigation
    currentPage,
    setCurrentPage,

    // Search and filters
    searchQuery,
    setSearchQuery,

    // Stats
    dashboardStats,
    upcomingTours,

    // Data loading functions
    loadDashboardData,
    loadTourPackages,
    loadBookings,
    loadMessages,
    loadActivities,
    loadNotifications,

    // Actions
    createTourPackage,
    updateBookingStatus,
    markNotificationAsRead,
    markMessageAsRead,
    deleteTourPackage,
    replyToMessage,

    // UI State
    showCreateTourModal,
    setShowCreateTourModal,
    showBookingRequestsModal,
    setShowBookingRequestsModal,

    // Loading states
    isLoading,
    setIsLoading,
    error,
    setError,

    // User ID
    organizerId,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
