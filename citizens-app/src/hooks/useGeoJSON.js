import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { simplifyGeoJSON, filterGeoJSONByBounds, isPointInBounds } from '../utils/geoUtils';
import { API_BASE_URL } from '../config/api';

const GEOJSON_CACHE_KEY = 'cached_wards_geojson';
const CACHE_EXPIRY_HOURS = 2; // Reduced cache time for more frequent updates
const FALLBACK_GEOJSON_URL = 'https://raw.githubusercontent.com/Thabang-777/wards-geojson/main/wards.geojson';

export const useGeoJSON = (mapBounds = null, simplificationTolerance = 0.005) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('cache');

  // Load and cache GeoJSON data
  useEffect(() => {
    loadGeoJSON();
  }, []);

  const loadGeoJSON = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cachedData = await getCachedGeoJSON();
      if (cachedData) {
        setDataSource('cache');
        setGeoJsonData(cachedData);
        setLoading(false);
        return;
      }

      // Try to load from backend API first
      let rawGeoJSON;
      try {
        const response = await fetch(`${API_BASE_URL}/api/wards/boundaries/simplified`);
        if (response.ok) {
          const data = await response.json();
          rawGeoJSON = data.data.geojson;
          setDataSource('api');
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        console.log('API not available, falling back to GitHub:', apiError.message);
        // Fallback to GitHub URL
        const response = await fetch(FALLBACK_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        rawGeoJSON = await response.json();
        setDataSource('github');
      }
      

      // Aggressive simplification for mobile performance
      const simplifiedGeoJSON = simplifyGeoJSON(rawGeoJSON, simplificationTolerance);
      
      // Further reduce data size by removing unnecessary properties
      const optimizedGeoJSON = {
        ...simplifiedGeoJSON,
        features: simplifiedGeoJSON.features.map(feature => ({
          type: 'Feature',
          properties: {
            id: feature.properties?.id || feature.properties?.WARD_ID,
            name: feature.properties?.name || feature.properties?.WARD_NAME,
            municipality: feature.properties?.municipality || feature.properties?.MUNICIPALITY
          },
          geometry: feature.geometry
        }))
      };

      // Cache the simplified data
      await cacheGeoJSON(optimizedGeoJSON);
      
      setGeoJsonData(optimizedGeoJSON);
    } catch (err) {
      console.error('Failed to load GeoJSON:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCachedGeoJSON = async () => {
    try {
      const cached = await AsyncStorage.getItem(GEOJSON_CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = (now - timestamp) / (1000 * 60 * 60); // hours

      if (cacheAge > CACHE_EXPIRY_HOURS) {
        await AsyncStorage.removeItem(GEOJSON_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to load cached GeoJSON:', error);
      return null;
    }
  };

  const cacheGeoJSON = async (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(GEOJSON_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache GeoJSON:', error);
    }
  };

  // Aggressively filter GeoJSON based on map bounds for performance
  const filteredGeoJSON = useMemo(() => {
    if (!geoJsonData) return geoJsonData;
    
    if (!mapBounds) {
      // If no bounds, limit to first 50 features for initial load
      return {
        ...geoJsonData,
        features: geoJsonData.features.slice(0, 50)
      };
    }
    
    // Filter by bounds and limit results
    const filtered = filterGeoJSONByBounds(geoJsonData, mapBounds);
    return {
      ...filtered,
      features: filtered.features.slice(0, 100) // Max 100 features at once
    };
  }, [geoJsonData, mapBounds]);

  const refreshGeoJSON = () => {
    AsyncStorage.removeItem(GEOJSON_CACHE_KEY);
    loadGeoJSON();
  };

  return {
    geoJsonData: filteredGeoJSON,
    loading,
    error,
    refreshGeoJSON,
    dataSource,
    totalFeatures: geoJsonData?.features?.length || 0
  };
};