import { useState, useEffect } from 'react';
import { useGeoJSON } from './useGeoJSON';
import { findWardForPoint } from '../utils/geoUtils';

export const useWards = () => {
  const { geoJsonData, loading, error } = useGeoJSON();

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
    loading,
    error,
    findWardByLocation,
    getAllWards,
  };
};