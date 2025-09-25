import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { supabase } from '../config/supabase';

class ReportService {
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    };
  }

  async createReport(reportData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create report');
      }

      return data.data.report;
    } catch (error) {
      throw error;
    }
  }

  async getReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }

      return {
        reports: data.data.reports,
        total: data.data.total,
        limit: data.data.limit,
        offset: data.data.offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyReports(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}${API_ENDPOINTS.MY_REPORTS}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch your reports');
      }

      return {
        reports: data.data.reports,
        total: data.data.total,
        limit: data.data.limit,
        offset: data.data.offset,
      };
    } catch (error) {
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}/${reportId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch report');
      }

      return data.data.report;
    } catch (error) {
      throw error;
    }
  }

  async upvoteReport(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      const url = API_ENDPOINTS.REPORT_UPVOTE.replace('{id}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upvote report');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async removeUpvote(reportId) {
    try {
      const headers = await this.getAuthHeaders();
      const url = API_ENDPOINTS.REPORT_UPVOTE.replace('{id}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove upvote');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateReport(reportId, updates) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REPORTS}/${reportId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update report');
      }

      return data.data.report;
    } catch (error) {
      throw error;
    }
  }

  async getStatusUpdates(reportId) {
    try {
      const url = API_ENDPOINTS.STATUS_UPDATES.replace('{reportId}', reportId);
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status updates');
      }

      return data.data.status_updates;
    } catch (error) {
      throw error;
    }
  }
}

export default new ReportService();