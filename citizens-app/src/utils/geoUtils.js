import simplify from 'simplify-geojson';

/**
 * Checks if a point is inside a polygon using ray casting algorithm
 * @param {Object} point - {latitude, longitude}
 * @param {Array} polygon - Array of [longitude, latitude] coordinates
 * @returns {boolean}
 */
export const isPointInPolygon = (point, polygon) => {
  const { latitude: lat, longitude: lng } = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Finds which ward a point belongs to
 * @param {Object} point - {latitude, longitude}
 * @param {Object} geoJsonData - GeoJSON data with ward polygons
 * @returns {Object|null} Ward feature or null if not found
 */
export const findWardForPoint = (point, geoJsonData) => {
  if (!geoJsonData?.features || !point) return null;
  
  for (const feature of geoJsonData.features) {
    if (feature.geometry?.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0];
      if (isPointInPolygon(point, coordinates)) {
        return feature;
      }
    } else if (feature.geometry?.type === 'MultiPolygon') {
      for (const polygon of feature.geometry.coordinates) {
        const coordinates = polygon[0];
        if (isPointInPolygon(point, coordinates)) {
          return feature;
        }
      }
    }
  }
  
  return null;
};

/**
 * Renders GeoJSON polygons as React Native Maps Polygon components
 * @param {Object} geoJsonData - GeoJSON data
 * @param {Object} options - Rendering options
 * @returns {Array} Array of Polygon components
 */
export const renderGeoJSONPolygons = (geoJsonData, options = {}) => {
  if (!geoJsonData?.features) return [];
  
  const {
    strokeColor = '#2196F3',
    fillColor = 'rgba(33, 150, 243, 0.1)',
    strokeWidth = 1,
    onPress = null,
  } = options;
  
  const polygons = [];
  
  geoJsonData.features.forEach((feature, index) => {
    if (feature.geometry?.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0].map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
      
      polygons.push({
        id: feature.properties?.id || `polygon-${index}`,
        coordinates,
        strokeColor,
        fillColor,
        strokeWidth,
        feature,
        onPress: onPress ? () => onPress(feature) : undefined,
      });
    } else if (feature.geometry?.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon, polyIndex) => {
        const coordinates = polygon[0].map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        polygons.push({
          id: feature.properties?.id || `multipolygon-${index}-${polyIndex}`,
          coordinates,
          strokeColor,
          fillColor,
          strokeWidth,
          feature,
          onPress: onPress ? () => onPress(feature) : undefined,
        });
      });
    }
  });
  
  return polygons;
};

/**
 * Simplifies GeoJSON polygons to reduce rendering complexity
 * @param {Object} geojson - The GeoJSON object
 * @param {number} tolerance - Simplification tolerance (higher = more simplified)
 * @returns {Object} Simplified GeoJSON
 */
export const simplifyGeoJSON = (geojson, tolerance = 0.001) => {
  try {
    return simplify(geojson, tolerance);
  } catch (error) {
    console.warn('Failed to simplify GeoJSON:', error);
    return geojson;
  }
};

/**
 * Checks if a point is within the current map bounds
 * @param {Object} point - {latitude, longitude}
 * @param {Object} bounds - Map bounds
 * @returns {boolean}
 */
export const isPointInBounds = (point, bounds) => {
  if (!bounds || !point) return true;
  
  return (
    point.latitude >= bounds.southWest.latitude &&
    point.latitude <= bounds.northEast.latitude &&
    point.longitude >= bounds.southWest.longitude &&
    point.longitude <= bounds.northEast.longitude
  );
};

/**
 * Filters GeoJSON features based on map bounds
 * @param {Object} geojson - The GeoJSON object
 * @param {Object} bounds - Map bounds
 * @returns {Object} Filtered GeoJSON
 */
export const filterGeoJSONByBounds = (geojson, bounds) => {
  if (!bounds || !geojson?.features) return geojson;

  const filteredFeatures = geojson.features.filter(feature => {
    if (!feature.geometry?.coordinates) return false;

    // For polygons, check if any coordinate is within bounds
    const coordinates = feature.geometry.coordinates[0] || [];
    return coordinates.some(coord => 
      isPointInBounds({ latitude: coord[1], longitude: coord[0] }, bounds)
    );
  });

  return {
    ...geojson,
    features: filteredFeatures
  };
};

/**
 * Calculates distance between two points using Haversine formula
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};