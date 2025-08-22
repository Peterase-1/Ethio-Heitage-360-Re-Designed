import axios from 'axios';

const API_URL = '/api/upload';

const uploadFile = async (file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await axios.post(`${API_URL}/single`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading file', error);
    throw error;
  }
};

const uploadMultipleFiles = async (files, onProgress) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await axios.post(`${API_URL}/multiple`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading files', error);
    throw error;
  }
};

const uploadArtifactImages = async (artifactId, images, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('artifactId', artifactId);
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await axios.post(`${API_URL}/artifact-images`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading artifact images', error);
    throw error;
  }
};

const uploadProfilePicture = async (userId, file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profilePicture', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    };

    const response = await axios.post(`${API_URL}/profile-picture`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture', error);
    throw error;
  }
};

const deleteFile = async (fileId) => {
  try {
    const response = await axios.delete(`${API_URL}/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file', error);
    throw error;
  }
};

const getFileInfo = async (fileId) => {
  try {
    const response = await axios.get(`${API_URL}/info/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting file info', error);
    throw error;
  }
};

const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    minDimensions = null,
    maxDimensions = null,
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

const compressImage = async (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

export default {
  uploadFile,
  uploadMultipleFiles,
  uploadArtifactImages,
  uploadProfilePicture,
  deleteFile,
  getFileInfo,
  validateFile,
  compressImage,
};
