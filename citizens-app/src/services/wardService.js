import { API_BASE_URL } from '../config/api';
import { supabase } from '../config/supabase';

class WardService {
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    };
  }

  async getWards(municipalityId = null, simplified = true) {
    try {
      const params = new URLSearchParams();
      if (municipalityId) params.append('municipality_id', municipalityId);
      if (simplified) params.append('simplified', 'true');
      
      const response = await fetch(`${API_BASE_URL}/api/wards?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wards');
      }

      return data.data.wards;
    } catch (error) {
      throw error;
    }
  }

  async getWardById(wardId, includeGeojson = false) {
    try {
      const params = includeGeojson ? '?include_geojson=true' : '';
      
      const response = await fetch(`${API_BASE_URL}/api/wards/${wardId}${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ward');
      }

      return data.data.ward;
    } catch (error) {
      throw error;
    }
  }

  async getSimplifiedBoundaries(municipalityId = null) {
    try {
      const params = municipalityId ? `?municipality_id=${municipalityId}` : '';
      
      const response = await fetch(`${API_BASE_URL}/api/wards/boundaries/simplified${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ward boundaries');
      }

      return data.data.geojson;
    } catch (error) {
      throw error;
    }
  }

  async importWards(geojsonUrl, municipalityId = null, simplifyTolerance = 0.001) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/wards/import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          geojson_url: geojsonUrl,
          municipality_id: municipalityId,
          simplify_tolerance: simplifyTolerance,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import wards');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new WardService();