import api from '../utils/api';

class VirtualMuseumService {
  /**
   * Get museum virtual museum submissions
   */
  async getSubmissions(params = {}) {
    console.log('=== GET VIRTUAL MUSEUM SUBMISSIONS API CALL ===');
    console.log('Params:', params);

    try {
      const response = await api.get('/virtual-museum/submissions', { params });
      console.log('Submissions API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get submissions:', error.message);
      throw error;
    }
  }

  /**
   * Get single submission
   */
  async getSubmission(id) {
    console.log('=== GET VIRTUAL MUSEUM SUBMISSION API CALL ===');
    console.log('Submission ID:', id);

    try {
      const response = await api.get(`/virtual-museum/submissions/${id}`);
      console.log('Submission API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get submission:', error.message);
      throw error;
    }
  }

  /**
   * Create new submission
   */
  async createSubmission(submissionData) {
    console.log('=== CREATE VIRTUAL MUSEUM SUBMISSION API CALL ===');
    console.log('Submission data:', submissionData);

    try {
      const response = await api.post('/virtual-museum/submissions', submissionData);
      console.log('Create submission API response:', response);
      return response;
    } catch (error) {
      console.error('Could not create submission:', error.message);
      throw error;
    }
  }

  /**
   * Update submission
   */
  async updateSubmission(id, submissionData) {
    console.log('=== UPDATE VIRTUAL MUSEUM SUBMISSION API CALL ===');
    console.log('Submission ID:', id);
    console.log('Update data:', submissionData);

    try {
      const response = await api.put(`/virtual-museum/submissions/${id}`, submissionData);
      console.log('Update submission API response:', response);
      return response;
    } catch (error) {
      console.error('Could not update submission:', error.message);
      throw error;
    }
  }

  /**
   * Delete submission
   */
  async deleteSubmission(id) {
    console.log('=== DELETE VIRTUAL MUSEUM SUBMISSION API CALL ===');
    console.log('Submission ID:', id);

    try {
      const response = await api.delete(`/virtual-museum/submissions/${id}`);
      console.log('Delete submission API response:', response);
      return response;
    } catch (error) {
      console.error('Could not delete submission:', error.message);
      throw error;
    }
  }

  /**
   * Get museum statistics
   */
  async getStats() {
    console.log('=== GET VIRTUAL MUSEUM STATS API CALL ===');

    try {
      const response = await api.get('/virtual-museum/stats');
      console.log('Stats API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get stats:', error.message);
      throw error;
    }
  }

  /**
   * Get available artifacts
   */
  async getAvailableArtifacts() {
    console.log('=== GET AVAILABLE ARTIFACTS API CALL ===');

    try {
      const response = await api.get('/virtual-museum/artifacts');
      console.log('Available artifacts API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get available artifacts:', error.message);
      throw error;
    }
  }

  /**
   * Submit for review
   */
  async submitForReview(id) {
    console.log('=== SUBMIT FOR REVIEW API CALL ===');
    console.log('Submission ID:', id);

    try {
      const response = await api.post(`/virtual-museum/submissions/${id}/submit`);
      console.log('Submit for review API response:', response);
      return response;
    } catch (error) {
      console.error('Could not submit for review:', error.message);
      throw error;
    }
  }

  /**
   * Get public submissions (for visitors)
   */
  async getPublicSubmissions(params = {}) {
    console.log('=== GET PUBLIC SUBMISSIONS API CALL ===');
    console.log('Params:', params);

    try {
      const response = await api.get('/virtual-museum/public', { params });
      console.log('Public submissions API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get public submissions:', error.message);
      throw error;
    }
  }

  /**
   * View public submission details
   */
  async viewPublicSubmission(id) {
    console.log('=== VIEW PUBLIC SUBMISSION API CALL ===');
    console.log('Submission ID:', id);

    try {
      const response = await api.get(`/virtual-museum/public/${id}`);
      console.log('Public submission view API response:', response);
      return response;
    } catch (error) {
      console.error('Could not view public submission:', error.message);
      throw error;
    }
  }
}

export default new VirtualMuseumService();
