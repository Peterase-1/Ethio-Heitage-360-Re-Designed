import React, { useState } from 'react';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Search,
  Book,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Headphones,
  MessageSquare,
  FileText,
  Download,
  ExternalLink,
  Lightbulb,
  Heart,
  Zap,
  Shield
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Support = ({ darkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          id: 1,
          question: 'How do I create an account and get started?',
          answer: 'Creating an account is simple! Click the "Sign Up" button in the top right corner, fill in your details, and verify your email. Once verified, you can browse our course catalog and start learning about Ethiopian heritage immediately.'
        },
        {
          id: 2,
          question: 'How do I enroll in a course?',
          answer: 'To enroll in a course, browse our course catalog, select the course you\'re interested in, and click "Enroll Now". If you\'re not logged in, you\'ll be prompted to create an account first. Most of our courses are free!'
        },
        {
          id: 3,
          question: 'What devices can I use to access the platform?',
          answer: 'Our platform works on all modern devices including computers, tablets, and smartphones. We recommend using the latest version of Chrome, Firefox, Safari, or Edge for the best experience.'
        }
      ]
    },
    {
      id: 'courses',
      title: 'Courses & Learning',
      icon: '📚',
      questions: [
        {
          id: 4,
          question: 'Are the courses really free?',
          answer: 'Yes! All our Ethiopian heritage courses are completely free. We believe education about cultural heritage should be accessible to everyone.'
        },
        {
          id: 5,
          question: 'How long do I have access to a course after enrolling?',
          answer: 'Once you enroll in a course, you have lifetime access to all course materials. You can learn at your own pace and revisit content whenever you want.'
        },
        {
          id: 6,
          question: 'Do I get a certificate when I complete a course?',
          answer: 'Yes! You\'ll receive a completion certificate for each course you finish. Certificates include your name, course title, completion date, and can be downloaded as PDF files.'
        },
        {
          id: 7,
          question: 'Can I download course materials for offline viewing?',
          answer: 'Most text-based materials and worksheets can be downloaded. Video content is available for streaming only to ensure the best quality and up-to-date content.'
        }
      ]
    },
    {
      id: 'games',
      title: 'Educational Games',
      icon: '🎮',
      questions: [
        {
          id: 8,
          question: 'What types of educational games are available?',
          answer: 'We offer various educational games including quizzes, puzzles, memory games, virtual tours, and interactive simulations covering Ethiopian history, culture, geography, and traditions.'
        },
        {
          id: 9,
          question: 'Do I need special software to play the games?',
          answer: 'No special software is needed! All our games run directly in your web browser. Just make sure you have a stable internet connection for the best experience.'
        },
        {
          id: 10,
          question: 'How do achievements and points work?',
          answer: 'You earn points by completing games, courses, and daily challenges. Achievements are unlocked by reaching milestones like completing your first course or maintaining a learning streak.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: '⚙️',
      questions: [
        {
          id: 11,
          question: 'A video won\'t play or keeps buffering. What should I do?',
          answer: 'Try refreshing the page first. If the issue persists, check your internet connection. For persistent issues, try clearing your browser cache or switching to a different browser.'
        },
        {
          id: 12,
          question: 'I\'m having trouble logging into my account.',
          answer: 'First, make sure you\'re using the correct email and password. If you forgot your password, click "Forgot Password" on the login page. If you\'re still having issues, contact our support team.'
        },
        {
          id: 13,
          question: 'The website is running slowly. How can I fix this?',
          answer: 'Try closing other browser tabs, clearing your browser cache, or restarting your browser. If you\'re on a mobile device, ensure you have a stable Wi-Fi or data connection.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: '👤',
      questions: [
        {
          id: 14,
          question: 'How do I update my profile information?',
          answer: 'Go to your user dashboard and click on "Profile Settings". From there, you can update your name, email, profile picture, and learning preferences.'
        },
        {
          id: 15,
          question: 'Can I change my email address?',
          answer: 'Yes, you can change your email address in your profile settings. You\'ll need to verify your new email address before the change takes effect.'
        },
        {
          id: 16,
          question: 'How do I delete my account?',
          answer: 'If you need to delete your account, please contact our support team. We\'ll help you with the process and ensure all your data is properly removed.'
        }
      ]
    }
  ];

  const supportChannels = [
    {
      id: 'live-chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Mon-Fri, 9AM-6PM EST',
      responseTime: '< 2 minutes',
      color: 'bg-blue-500'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: '24/7',
      responseTime: '< 24 hours',
      color: 'bg-green-500'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: Phone,
      availability: 'Mon-Fri, 10AM-5PM EST',
      responseTime: 'Immediate',
      color: 'bg-purple-500'
    }
  ];

  const helpResources = [
    {
      id: 1,
      title: 'User Guide',
      description: 'Complete guide to using our platform',
      icon: Book,
      type: 'PDF',
      size: '2.3 MB'
    },
    {
      id: 2,
      title: 'Video Tutorials',
      description: 'Step-by-step video instructions',
      icon: Users,
      type: 'Playlist',
      size: '12 videos'
    },
    {
      id: 3,
      title: 'Course Creation Guide',
      description: 'For instructors wanting to create courses',
      icon: FileText,
      type: 'PDF',
      size: '1.8 MB'
    },
    {
      id: 4,
      title: 'Accessibility Features',
      description: 'Learn about our accessibility options',
      icon: Shield,
      type: 'Web',
      size: 'Online'
    }
  ];

  const quickActions = [
    {
      title: 'Reset Password',
      description: 'Having trouble logging in?',
      icon: Shield,
      action: 'reset-password'
    },
    {
      title: 'Download Certificate',
      description: 'Get your completion certificates',
      icon: Download,
      action: 'certificates'
    },
    {
      title: 'Report a Bug',
      description: 'Found something not working?',
      icon: AlertCircle,
      action: 'report-bug'
    },
    {
      title: 'Suggest a Feature',
      description: 'Have an idea for improvement?',
      icon: Lightbulb,
      action: 'suggest-feature'
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      category: 'general',
      message: '',
      priority: 'medium'
    });
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const renderHelpCenter = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <div key={action.action} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {filteredFaqs.map(category => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.questions.map(faq => (
                  <div key={faq.id}>
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Resources */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {helpResources.map(resource => {
            const Icon = resource.icon;
            return (
              <div key={resource.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{resource.type}</span> · {resource.size}
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium">
                    Open
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-8">
      {/* Contact Options */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportChannels.map(channel => {
            const Icon = channel.icon;
            return (
              <div key={channel.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${channel.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{channel.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {channel.availability}
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Response time: {channel.responseTime}
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                  {channel.title === 'Live Chat' ? 'Start Chat' : 
                   channel.title === 'Email Support' ? 'Send Email' : 'Call Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
        
        <form onSubmit={handleContactSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={contactForm.category}
                onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="course">Course Related</option>
                <option value="account">Account Issues</option>
                <option value="billing">Billing Question</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={contactForm.priority}
                onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={contactForm.subject}
              onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your inquiry"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide as much detail as possible..."
            />
          </div>
          
          <div className="flex items-start">
            <input type="checkbox" className="mt-1 mr-3" required />
            <label className="text-sm text-gray-600">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            <Send className="w-5 h-5 mr-2" />
            Send Message
          </button>
        </form>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Email</h4>
              <p className="text-gray-600">support@ethioheritage.com</p>
              <p className="text-gray-600">info@ethioheritage.com</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-gray-600">+251 11 123 4567</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Address</h4>
              <p className="text-gray-600">123 Heritage Street</p>
              <p className="text-gray-600">Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare },
    { id: 'status', label: 'System Status', icon: Info }
  ];

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-2">Get help, find answers, and contact our support team</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'help' && renderHelpCenter()}
          {activeTab === 'contact' && renderContact()}
          {activeTab === 'status' && (
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Learning Platform</h3>
                      <p className="text-sm text-gray-600">All systems operational</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Educational Games</h3>
                      <p className="text-sm text-gray-600">All systems operational</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">User Authentication</h3>
                      <p className="text-sm text-gray-600">Scheduled maintenance (2:00-4:00 AM EST)</p>
                    </div>
                  </div>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">Support System</h3>
                      <p className="text-sm text-gray-600">All systems operational</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Upcoming Maintenance</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      We have scheduled maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM EST. 
                      During this time, user authentication may be temporarily unavailable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Support;
