import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { simplifyGeoJSON, filterGeoJSONByBounds } from '../utils/geoUtils';

const GEOJSON_CACHE_KEY = 'cached_wards_geojson';
const CACHE_EXPIRY_HOURS = 24;
const GEOJSON_URL = 'https://raw.githubusercontent.com/Thabang-777/wards-geojson/main/wards.geojson';

export const useGeoJSON = (mapBounds = null, simplificationTolerance = 0.001) => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setGeoJsonData(cachedData);
        setLoading(false);
        return;
      }

      // Load from remote URL
      const response = await fetch(GEOJSON_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
      }
      
      const rawGeoJSON = await response.json();

      // Simplify the GeoJSON to improve performance
      const simplifiedGeoJSON = simplifyGeoJSON(rawGeoJSON, simplificationTolerance);

      // Cache the simplified data
      await cacheGeoJSON(simplifiedGeoJSON);
      
      setGeoJsonData(simplifiedGeoJSON);
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

  // Filter GeoJSON based on map bounds for performance
  const filteredGeoJSON = useMemo(() => {
    if (!geoJsonData || !mapBounds) return geoJsonData;
    return filterGeoJSONByBounds(geoJsonData, mapBounds);
  }, [geoJsonData, mapBounds]);

  const refreshGeoJSON = () => {
    AsyncStorage.removeItem(GEOJSON_CACHE_KEY);
    loadGeoJSON();
  };

  return {
    geoJsonData: filteredGeoJSON,
    loading,
    error,
    refreshGeoJSON
  };
};