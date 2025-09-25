import { useState, useEffect } from 'react';
import wardService from '../services/wardService';
import { findWardForPoint } from '../utils/geoUtils';

export const useWards = () => {
  const [wards, setWards] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWards();
  }, []);

  const loadWards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get simplified boundaries from API
      const boundaries = await wardService.getSimplifiedBoundaries();
      setGeoJsonData(boundaries);
      
      // Also get ward list for metadata
      const wardsList = await wardService.getWards(null, true);
      setWards(wardsList);
    } catch (err) {
      console.error('Failed to load wards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const findWardByLocation = (latitude, longitude) => {
    if (!geoJsonData || loading) return null;
    
    const point = { latitude, longitude };
    const ward = findWardForPoint(point, geoJsonData);
    
    if (ward) {
      return {
        id: ward.properties?.id || ward.properties?.WARD_ID,
        name: ward.properties?.name || ward.properties?.WARD_NAME || `Ward ${ward.properties?.WARD_ID}`,
        municipality: ward.properties?.municipality || ward.properties?.MUNICIPALITY,
        properties: ward.properties,
      };
    }
    
    return null;
  };

  const getAllWards = () => {
    if (wards.length > 0) return wards;
    
    if (!geoJsonData || loading) return [];
    
    return geoJsonData.features.map(feature => ({
      id: feature.properties?.id || feature.properties?.WARD_ID,
      name: feature.properties?.name || feature.properties?.WARD_NAME || `Ward ${feature.properties?.WARD_ID}`,
      municipality: feature.properties?.municipality || feature.properties?.MUNICIPALITY,
      properties: feature.properties,
      geometry: feature.geometry,
    }));
  };

  return {
    geoJsonData,
    wards,
    loading,
    error,
    findWardByLocation,
    getAllWards,
    refreshWards: loadWards,
  };
};