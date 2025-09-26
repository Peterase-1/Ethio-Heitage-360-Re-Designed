import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  Award,
  Trophy,
  Download,
  Share2,
  Eye,
  Calendar,
  CheckCircle,
  Star,
  Users,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import educationService from '../../services/educationService';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      console.log('🏆 Loading certificates from education service...');
      
      // Load certificates from backend using education service
      const certificatesData = await educationService.getCertificates();
      console.log('✅ Certificates loaded:', certificatesData);
      
      if (certificatesData.success) {
        setCertificates(certificatesData.certificates || []);
        
        const count = certificatesData.certificates?.length || 0;
        if (count > 0) {
          toast.success(`${count} certificate${count !== 1 ? 's' : ''} loaded successfully`);
        } else {
          console.log('🏆 No certificates found');
          toast.info('No certificates found. Complete courses to earn certificates!');
        }
      } else {
        console.error('❌ Failed to load certificates:', certificatesData.error);
        toast.error(certificatesData.error || 'Failed to load certificates');
        setCertificates([]);
      }
    } catch (error) {
      console.error('❌ Error loading certificates:', error);
      toast.error('Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || cert.category.toLowerCase() === filterBy.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const downloadCertificate = async (certificate) => {
    try {
      console.log('💾 Downloading certificate:', certificate._id);
      const result = await educationService.downloadCertificate(certificate._id);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to download certificate');
      }
      // Success message is handled by the service
    } catch (error) {
      console.error('❌ Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = (certificate) => {
    const shareText = `I just earned a certificate in "${certificate.courseTitle}" from Heritage 360! 🏆\n\nVerify at: ${certificate.verificationUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${certificate.courseTitle} Certificate`,
        text: shareText,
        url: certificate.verificationUrl
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Certificate details copied to clipboard!');
    }
  };

  const viewCertificate = (certificate) => {
    window.open(certificate.verificationUrl, '_blank');
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'text-green-700 bg-green-100';
      case 'A': return 'text-green-600 bg-green-50';
      case 'B+': return 'text-blue-600 bg-blue-50';
      case 'B': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'history': return '🏛️';
      case 'architecture': return '🏗️';
      case 'culture': return '🎭';
      case 'art': return '🎨';
      default: return '📚';
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Trophy className="h-8 w-8 text-amber-600 mr-3" />
              My Certificates
            </h1>
            <p className="text-gray-600 mt-1">Your earned credentials and achievements in Ethiopian heritage education</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                  <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">A+ Grades</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certificates.filter(c => c.grade === 'A+').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(certificates.map(c => c.category)).size}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {certificates.filter(c => {
                      const certDate = new Date(c.issuedDate);
                      const now = new Date();
                      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="history">History</option>
                  <option value="architecture">Architecture</option>
                  <option value="culture">Culture</option>
                  <option value="art">Art</option>
                </select>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          {filteredCertificates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No certificates match your criteria' : 'No certificates yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Complete courses to earn your first certificate'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCertificates.map(certificate => (
                <div key={certificate._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Certificate Header */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{getCategoryIcon(certificate.category)}</div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(certificate.grade)}`}>
                        Grade: {certificate.grade}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{certificate.courseTitle}</h3>
                    <p className="text-sm text-gray-600 mb-3">{certificate.description}</p>
                    
                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-white text-xs text-gray-700 rounded-full border border-gray-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium text-gray-900">{certificate.instructor}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{certificate.courseDuration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Issued:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Credential ID:</span>
                        <span className="font-mono text-xs text-amber-600 font-medium">
                          {certificate.credentialId}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadCertificate(certificate)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => viewCertificate(certificate)}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => shareCertificate(certificate)}
                        className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Verification Link */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <a
                        href={certificate.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify Certificate Authenticity
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">About Your Certificates</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• All certificates are digitally signed and verifiable</p>
              <p>• Each certificate has a unique credential ID for verification</p>
              <p>• Certificates can be shared on professional networks like LinkedIn</p>
              <p>• Downloaded certificates are high-resolution PDF files suitable for printing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
