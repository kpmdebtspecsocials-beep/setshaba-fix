import { useState, useEffect } from 'react';
import locationService from '../services/locationService';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentLocation = await locationService.getCurrentLocation();
      setLocation(currentLocation);
      
      return currentLocation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const address = await locationService.reverseGeocode(latitude, longitude);
      return address;
    } catch (err) {
      throw err;
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    reverseGeocode,
  };
};

export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestPermission = async () => {
    try {
      setLoading(true);
      const granted = await locationService.requestLocationPermission();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      setHasPermission(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    hasPermission,
    loading,
    requestPermission,
  };
};