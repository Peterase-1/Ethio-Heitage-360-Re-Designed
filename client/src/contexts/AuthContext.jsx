import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Export AuthContext for named imports
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('user');
    const savedCourses = localStorage.getItem('enrolledCourses');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCourses) {
      setEnrolledCourses(JSON.parse(savedCourses));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with real authentication
      const userData = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'student',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinDate: new Date().toISOString(),
        progress: 0,
        completedCourses: 0,
        points: 0
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    try {
      const userData = {
        id: Date.now(),
        email,
        name,
        role: 'student',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinDate: new Date().toISOString(),
        progress: 0,
        completedCourses: 0,
        points: 0
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setEnrolledCourses([]);
    localStorage.removeItem('user');
    localStorage.removeItem('enrolledCourses');
  };

  const enrollInCourse = (courseId) => {
    const newEnrollment = {
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completed: false
    };
    
    const updatedCourses = [...enrolledCourses, newEnrollment];
    setEnrolledCourses(updatedCourses);
    localStorage.setItem('enrolledCourses', JSON.stringify(updatedCourses));
    
    // Update user points
    const updatedUser = { ...user, points: user.points + 50 };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateCourseProgress = (courseId, progress) => {
    const updatedCourses = enrolledCourses.map(course => 
      course.courseId === courseId 
        ? { ...course, progress, completed: progress === 100 }
        : course
    );
    
    setEnrolledCourses(updatedCourses);
    localStorage.setItem('enrolledCourses', JSON.stringify(updatedCourses));
    
    // Update user stats
    const completedCount = updatedCourses.filter(c => c.completed).length;
    const avgProgress = updatedCourses.reduce((sum, c) => sum + c.progress, 0) / updatedCourses.length || 0;
    const points = user.points + (progress === 100 ? 100 : 10);
    
    const updatedUser = { 
      ...user, 
      progress: Math.round(avgProgress),
      completedCourses: completedCount,
      points
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    enrolledCourses,
    login,
    signup,
    logout,
    enrollInCourse,
    updateCourseProgress,
    isEnrolled: (courseId) => enrolledCourses.some(c => c.courseId === courseId),
    getCourseProgress: (courseId) => {
      const course = enrolledCourses.find(c => c.courseId === courseId);
      return course ? course.progress : 0;
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
