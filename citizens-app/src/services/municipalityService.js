import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class MunicipalityService {
  async getMunicipalities(includeGeojson = false) {
    try {
      const queryParams = includeGeojson ? '?include_geojson=true' : '';
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MUNICIPALITIES}${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch municipalities');
      }

      return data.data.municipalities;
    } catch (error) {
      throw error;
    }
  }

  async getMunicipalityById(municipalityId, includeReports = false) {
    try {
      const queryParams = includeReports ? '?include_reports=true' : '';
      const url = API_ENDPOINTS.MUNICIPALITY_BY_ID.replace('{id}', municipalityId);
      
      const response = await fetch(`${API_BASE_URL}${url}${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch municipality');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getMunicipalityReports(municipalityId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = API_ENDPOINTS.MUNICIPALITY_REPORTS.replace('{id}', municipalityId);
      const fullUrl = `${API_BASE_URL}${url}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch municipality reports');
      }

      return {
        reports: data.data.reports,
        total: data.data.total,
        limit: data.data.limit,
        offset: data.data.offset,
        municipality: data.data.municipality,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new MunicipalityService();