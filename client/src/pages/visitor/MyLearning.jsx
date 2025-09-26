import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  BookOpen,
  Play,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Users,
  Star,
  CheckCircle,
  Target,
  BarChart3,
  Trophy,
  FileText,
  Video,
  Download
} from 'lucide-react';
import educationService from '../../services/educationService';
import { toast } from 'sonner';

const MyLearning = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [learningStats, setLearningStats] = useState({
    totalCoursesEnrolled: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    totalHoursLearned: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      console.log('📚 Loading real learning data from education service...');
      
      // Load enrolled courses from backend
      const enrolledData = await educationService.getEnrolledCourses();
      console.log('✅ Enrolled courses loaded:', enrolledData);
      
      // Load completed courses from backend
      const completedData = await educationService.getCompletedCourses();
      console.log('✅ Completed courses loaded:', completedData);
      
      // Load certificates from backend
      const certificatesData = await educationService.getCertificates();
      console.log('✅ Certificates loaded:', certificatesData);
      
      // Load learning statistics from backend
      const statsData = await educationService.getLearningStats();
      console.log('✅ Learning stats loaded:', statsData);

      // Set state with real data
      setEnrolledCourses(enrolledData.courses || []);
      setCompletedCourses(completedData.courses || []);
      setCertificates(certificatesData.certificates || []);
      setLearningStats(statsData.stats || {
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        totalHoursLearned: 0,
        averageProgress: 0
      });

      const totalCourses = (enrolledData.courses?.length || 0) + (completedData.courses?.length || 0);
      if (totalCourses > 0) {
        toast.success(`Learning data loaded: ${totalCourses} courses found!`);
      } else {
        console.log('📚 No enrolled or completed courses found');
        toast.info('No learning data found. Start by enrolling in courses!');
      }

    } catch (error) {
      console.error('❌ Error loading learning data:', error);
      toast.error('Failed to load learning data');
      
      // Set empty states on error
      setEnrolledCourses([]);
      setCompletedCourses([]);
      setCertificates([]);
      setLearningStats({
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        totalHoursLearned: 0,
        averageProgress: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const continueCourse = async (courseId) => {
    try {
      console.log('▶️ Continuing course:', courseId);
      toast.success('Opening course...');
      // Navigate to course content (implement when course viewer is ready)
      // For now, show course info
      const course = enrolledCourses.find(c => c._id === courseId);
      if (course) {
        toast.info(`Opening "${course.title}"...`);
        // You can navigate to a course detail page here
        // navigate(`/courses/${courseId}/learn`);
      }
    } catch (error) {
      console.error('❌ Error continuing course:', error);
      toast.error('Failed to open course');
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      console.log('💾 Downloading certificate:', certificateId);
      const result = await educationService.downloadCertificate(certificateId);
      
      if (result.success) {
        console.log('✅ Certificate download initiated');
        // Success toast is handled by the service
      } else {
        toast.error('Failed to download certificate');
      }
    } catch (error) {
      console.error('❌ Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <VisitorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your educational progress and achievements</p>
          </div>

          {/* Learning Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Enrolled Courses"
              value={learningStats.totalCoursesEnrolled}
              icon={BookOpen}
              description="Active enrollments"
              color="blue"
            />
            <StatCard
              title="Completed"
              value={learningStats.completedCourses}
              icon={CheckCircle}
              description="Courses finished"
              color="green"
            />
            <StatCard
              title="Certificates"
              value={learningStats.certificatesEarned}
              icon={Award}
              description="Earned credentials"
              color="yellow"
            />
            <StatCard
              title="Hours Learned"
              value={learningStats.totalHoursLearned}
              icon={Clock}
              description="Total study time"
              color="purple"
            />
            <StatCard
              title="Avg Progress"
              value={`${learningStats.averageProgress}%`}
              icon={TrendingUp}
              description="Overall completion"
              color="amber"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { key: 'enrolled', label: 'Current Courses', count: enrolledCourses.length },
                  { key: 'completed', label: 'Completed', count: completedCourses.length },
                  { key: 'certificates', label: 'Certificates', count: certificates.length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.key
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Enrolled Courses Tab */}
              {activeTab === 'enrolled' && (
                <div className="space-y-6">
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
                      <p className="text-gray-600">Browse our course catalog to start learning</p>
                    </div>
                  ) : (
                    enrolledCourses.map(course => (
                      <div key={course._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {course.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{course.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">
                                  Progress: {course.completedLessons}/{course.totalLessons} lessons
                                </span>
                                <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{course.instructor}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>~{course.estimatedHours} hours</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => continueCourse(course._id)}
                            className="ml-6 flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                          >
                            <Play className="h-4 w-4" />
                            <span>Continue</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Completed Courses Tab */}
              {activeTab === 'completed' && (
                <div className="space-y-6">
                  {completedCourses.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No completed courses</h3>
                      <p className="text-gray-600">Complete your enrolled courses to see them here</p>
                    </div>
                  ) : (
                    completedCourses.map(course => (
                      <div key={course._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <CheckCircle className="h-6 w-6 text-green-500" />
                              <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Grade: {course.grade}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{course.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Completed: {new Date(course.completedDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.totalHours} hours</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              <Video className="h-4 w-4" />
                              <span>Review</span>
                            </button>
                            {course.certificateId && (
                              <button 
                                onClick={() => downloadCertificate(course.certificateId)}
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Award className="h-4 w-4" />
                                <span>Certificate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Certificates Tab */}
              {activeTab === 'certificates' && (
                <div className="space-y-6">
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                      <p className="text-gray-600">Complete courses to earn certificates</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map(certificate => (
                        <div key={certificate._id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6">
                          <div className="text-center">
                            <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{certificate.courseTitle}</h3>
                            <p className="text-sm text-gray-600 mb-4">Instructor: {certificate.instructor}</p>
                            <div className="space-y-2 text-sm text-gray-700">
                              <p><strong>Grade:</strong> {certificate.grade}</p>
                              <p><strong>Issued:</strong> {new Date(certificate.issuedDate).toLocaleDateString()}</p>
                              <p><strong>Credential ID:</strong> {certificate.credentialId}</p>
                            </div>
                            <button 
                              onClick={() => downloadCertificate(certificate._id)}
                              className="mt-4 flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors mx-auto"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
