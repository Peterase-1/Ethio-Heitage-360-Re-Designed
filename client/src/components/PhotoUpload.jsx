import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, X, Camera, MapPin, Calendar, Tag, Users, 
  CheckCircle, AlertCircle, Info, Plus, Minus, Image as ImageIcon,
  FileImage, Loader, Eye, Star, Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import imageService from '../services/imageService';

const PhotoUpload = ({ onUploadComplete, maxFiles = 5, allowMultiple = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);

  // Form data for photo metadata
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    region: '',
    period: '',
    category: '',
    photographer: user?.name || '',
    year: new Date().getFullYear().toString(),
    tags: [],
    significance: '',
    isPublic: true
  });

  const [newTag, setNewTag] = useState('');
  const categories = imageService.getCategories();
  const regions = imageService.getRegions();
  const periods = imageService.getPeriods();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelection = (files) => {
    if (!allowMultiple) {
      files = [files[0]];
    }

    const remainingSlots = maxFiles - uploadedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newFiles = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'pending',
      metadata: { ...formData }
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0 && !showForm) {
      setCurrentFile(newFiles[0]);
      setShowForm(true);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelection(files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });

    if (currentFile?.id === fileId) {
      const remaining = uploadedFiles.filter(f => f.id !== fileId);
      setCurrentFile(remaining[0] || null);
      if (remaining.length === 0) {
        setShowForm(false);
      }
    }
  };

  const updateFileMetadata = (fileId, metadata) => {
    setUploadedFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, metadata: { ...f.metadata, ...metadata } } : f)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      setFormData({ ...formData, tags: updatedTags });
      
      if (currentFile) {
        updateFileMetadata(currentFile.id, { tags: updatedTags });
      }
      
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    setFormData({ ...formData, tags: updatedTags });
    
    if (currentFile) {
      updateFileMetadata(currentFile.id, { tags: updatedTags });
    }
  };

  const handleFormChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    if (currentFile) {
      updateFileMetadata(currentFile.id, { [field]: value });
    }
  };

  const switchToFile = (file) => {
    if (currentFile && currentFile.id !== file.id) {
      // Save current form data to current file
      updateFileMetadata(currentFile.id, formData);
    }
    
    // Load metadata from selected file
    setCurrentFile(file);
    setFormData(file.metadata);
  };

  const simulateUpload = async (file) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to upload photos');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please select at least one photo to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      for (const file of uploadedFiles) {
        if (file.status === 'pending') {
          setUploadedFiles(prev => 
            prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f)
          );

          await simulateUpload(file);

          setUploadedFiles(prev => 
            prev.map(f => f.id === file.id ? { ...f, status: 'completed' } : f)
          );
        }
      }

      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles);
      }

      // Reset form
      setTimeout(() => {
        setUploadedFiles([]);
        setCurrentFile(null);
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          region: '',
          period: '',
          category: '',
          photographer: user?.name || '',
          year: new Date().getFullYear().toString(),
          tags: [],
          significance: '',
          isPublic: true
        });
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Upload Heritage Photos
          </h2>
        </div>
        <p className="text-lg text-gray-600">
          Share your Ethiopian heritage photos with the community. Help preserve and showcase our cultural treasures.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Sign In Required</h3>
          <p className="text-amber-700">
            Please sign in to your account to upload and share heritage photos.
          </p>
          <button className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
            Sign In
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Drag & Drop Area */}
            {uploadedFiles.length < maxFiles && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Drop your heritage photos here
                </h3>
                <p className="text-gray-500 mb-4">
                  or click to browse your files
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
                  <span>Supports: JPEG, PNG, WebP</span>
                  <span>•</span>
                  <span>Max {maxFiles} files</span>
                  <span>•</span>
                  <span>Up to 10MB each</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={allowMultiple}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Uploaded Photos ({uploadedFiles.length}/{maxFiles})
                  </h3>
                  {uploadedFiles.every(f => f.status === 'completed') ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">All uploads completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || uploadedFiles.length === 0}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {isUploading ? 'Uploading...' : 'Upload All'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        currentFile?.id === file.id 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => switchToFile(file)}
                    >
                      <div className="aspect-square">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Status Overlay */}
                      {file.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <div className="text-sm">
                              {Math.round(uploadProgress[file.id] || 0)}%
                            </div>
                          </div>
                        </div>
                      )}

                      {file.status === 'completed' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* File Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                        <div className="text-xs truncate">{file.name}</div>
                        <div className="text-xs text-gray-300">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Form */}
          {showForm && currentFile && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <FileImage className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Photo Details</h3>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter photo title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Describe this heritage photo..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location & Region */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      placeholder="City, specific location..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => handleFormChange('region', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select region...</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Period & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Historical Period
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => handleFormChange('period', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select period...</option>
                      {periods.map(period => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleFormChange('year', e.target.value)}
                      min="1000"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Photographer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Photographer
                  </label>
                  <input
                    type="text"
                    value={formData.photographer}
                    onChange={(e) => handleFormChange('photographer', e.target.value)}
                    placeholder="Photographer name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags
                  </label>
                  
                  {/* Existing Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add New Tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cultural Significance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultural Significance
                  </label>
                  <textarea
                    value={formData.significance}
                    onChange={(e) => handleFormChange('significance', e.target.value)}
                    placeholder="Why is this photo culturally significant?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Privacy Setting */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleFormChange('isPublic', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPublic" className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4" />
                    Make this photo public and discoverable by other users
                  </label>
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Upload Guidelines:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Ensure you have rights to share this photo</li>
                        <li>• Use descriptive titles and accurate locations</li>
                        <li>• Include historical context when available</li>
                        <li>• Photos will be reviewed before publication</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
