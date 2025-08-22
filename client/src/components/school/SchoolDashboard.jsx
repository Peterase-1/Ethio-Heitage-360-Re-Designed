import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp,
  Bell,
  MessageSquare,
  MapPin,
  Star
} from 'lucide-react';
import { EthiopianIcons, EthiopianColors, EthiopianImageUrls } from '../../assets/EthiopianAssets';

const SchoolDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Mock data for schools with Ethiopian cultural context
    setSchools([
      {
        id: 1,
        name: 'Lalibela Heritage School',
        location: 'Lalibela, Amhara',
        students: 450,
        teachers: 25,
        established: 1995,
        image: EthiopianImageUrls.lalibela,
        type: 'Cultural Heritage',
        rating: 4.8
      },
      {
        id: 2,
        name: 'Blue Nile Academy',
        location: 'Bahir Dar, Amhara',
        students: 680,
        teachers: 35,
        established: 2001,
        image: EthiopianImageUrls.blueNile,
        type: 'General Education',
        rating: 4.6
      },
      {
        id: 3,
        name: 'Simien Mountains Institute',
        location: 'Gondar, Amhara',
        students: 320,
        teachers: 18,
        established: 2005,
        image: EthiopianImageUrls.simienMountains,
        type: 'Environmental Studies',
        rating: 4.9
      }
    ]);

    setCourses([
      {
        id: 1,
        title: 'Ethiopian History & Culture',
        students: 120,
        duration: '12 weeks',
        difficulty: 'Intermediate',
        image: EthiopianImageUrls.ancientManuscript,
        icon: EthiopianIcons.manuscript
      },
      {
        id: 2,
        title: 'Traditional Coffee Culture',
        students: 85,
        duration: '8 weeks',
        difficulty: 'Beginner',
        image: EthiopianImageUrls.coffeeBeansEthiopia,
        icon: EthiopianIcons.coffeeBean
      },
      {
        id: 3,
        title: 'Ancient Architecture Studies',
        students: 95,
        duration: '16 weeks',
        difficulty: 'Advanced',
        image: EthiopianImageUrls.lalibela,
        icon: EthiopianIcons.church
      }
    ]);

    setAchievements([
      { id: 1, title: 'Cultural Preservation Award', count: 12, icon: EthiopianIcons.shield },
      { id: 2, title: 'Academic Excellence', count: 28, icon: EthiopianIcons.meskelCross },
      { id: 3, title: 'Community Impact', count: 15, icon: EthiopianIcons.ethiopianHouse }
    ]);
  }, []);

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-green-600 to-yellow-500 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      style={isActive ? {
        background: `linear-gradient(135deg, ${EthiopianColors.green}, ${EthiopianColors.yellow})`
      } : {}}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const SchoolCard = ({ school }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={school.image} 
          alt={school.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <div 
            className="px-3 py-1 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: EthiopianColors.green }}
          >
            {school.type}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center text-white">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{school.location}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">{school.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{school.rating}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: EthiopianColors.green }}>
              {school.students}
            </div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: EthiopianColors.yellow }}>
              {school.teachers}
            </div>
            <div className="text-sm text-gray-600">Teachers</div>
          </div>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Established: {school.established}
        </div>
        <button 
          className="w-full py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${EthiopianColors.green}, ${EthiopianColors.yellow})` 
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-l-4"
         style={{ borderLeftColor: EthiopianColors.red }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${EthiopianColors.green}20` }}
          >
            {course.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{course.title}</h3>
            <p className="text-sm text-gray-600">{course.duration}</p>
          </div>
        </div>
        <span 
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: EthiopianColors.blue }}
        >
          {course.difficulty}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{course.students} students</span>
        </div>
        <button 
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300"
          style={{ backgroundColor: EthiopianColors.green }}
        >
          Join Course
        </button>
      </div>
    </div>
  );

  const AchievementBadge = ({ achievement }) => (
    <div 
      className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border-2"
      style={{ borderColor: `${EthiopianColors.yellow}40` }}
    >
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${EthiopianColors.green}20` }}
      >
        {achievement.icon}
      </div>
      <div 
        className="text-3xl font-bold mb-2"
        style={{ color: EthiopianColors.green }}
      >
        {achievement.count}
      </div>
      <div className="text-sm text-gray-600">{achievement.title}</div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+{trend}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Ethiopian Flag Colors */}
      <div 
        className="bg-gradient-to-r text-white p-6"
        style={{ 
          background: `linear-gradient(135deg, ${EthiopianColors.green}, ${EthiopianColors.yellow}, ${EthiopianColors.red})` 
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ethiopian Heritage Schools</h1>
              <p className="text-white/90">Cultural Education & Learning Platform</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2">
            <TabButton 
              id="overview" 
              label="Overview" 
              icon={TrendingUp} 
              isActive={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <TabButton 
              id="schools" 
              label="Schools" 
              icon={BookOpen} 
              isActive={activeTab === 'schools'} 
              onClick={() => setActiveTab('schools')} 
            />
            <TabButton 
              id="courses" 
              label="Courses" 
              icon={GraduationCap} 
              isActive={activeTab === 'courses'} 
              onClick={() => setActiveTab('courses')} 
            />
            <TabButton 
              id="achievements" 
              label="Achievements" 
              icon={Award} 
              isActive={activeTab === 'achievements'} 
              onClick={() => setActiveTab('achievements')} 
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Students" 
                value="1,450" 
                icon={Users} 
                trend={12} 
                color={EthiopianColors.green} 
              />
              <StatCard 
                title="Active Schools" 
                value="3" 
                icon={BookOpen} 
                trend={8} 
                color={EthiopianColors.yellow} 
              />
              <StatCard 
                title="Courses Available" 
                value="15" 
                icon={GraduationCap} 
                trend={25} 
                color={EthiopianColors.red} 
              />
              <StatCard 
                title="Achievements" 
                value="55" 
                icon={Award} 
                trend={18} 
                color={EthiopianColors.blue} 
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { text: 'New student enrolled in Lalibela Heritage School', time: '2 hours ago', icon: Users },
                  { text: 'Ethiopian History course completed by 15 students', time: '5 hours ago', icon: BookOpen },
                  { text: 'Blue Nile Academy received Excellence Award', time: '1 day ago', icon: Award },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${EthiopianColors.green}20` }}
                    >
                      <activity.icon className="w-4 h-4" style={{ color: EthiopianColors.green }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.text}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Ethiopian Heritage Schools</h2>
              <button 
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300"
                style={{ backgroundColor: EthiopianColors.green }}
              >
                Add New School
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.map(school => <SchoolCard key={school.id} school={school} />)}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Cultural Courses</h2>
              <button 
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300"
                style={{ backgroundColor: EthiopianColors.green }}
              >
                Create Course
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Achievements & Recognition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map(achievement => 
                <AchievementBadge key={achievement.id} achievement={achievement} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;
