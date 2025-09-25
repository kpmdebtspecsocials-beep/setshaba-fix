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
 * @param {number} tolerance - Simplification tolerance (0.001-0.01, higher = more simplified)
 * @returns {Object} Simplified GeoJSON
 */
export const simplifyGeoJSON = (geojson, tolerance = 0.005) => {
  try {
    // Use the simplify library with high tolerance for mobile performance
    const simplified = simplify(geojson, tolerance, true); // highQuality = true
    
    // Additional manual simplification for very complex polygons
    if (simplified.features) {
      simplified.features = simplified.features.map(feature => {
        if (feature.geometry?.type === 'Polygon' && feature.geometry.coordinates[0]) {
          const coords = feature.geometry.coordinates[0];
          // If polygon has too many points, reduce further
          if (coords.length > 100) {
            const step = Math.ceil(coords.length / 50); // Reduce to max 50 points
            const reducedCoords = coords.filter((_, index) => index % step === 0);
            // Ensure polygon is closed
            if (reducedCoords[reducedCoords.length - 1] !== coords[coords.length - 1]) {
              reducedCoords.push(coords[coords.length - 1]);
            }
            feature.geometry.coordinates[0] = reducedCoords;
          }
        }
        return feature;
      });
    }
    
    return simplified;
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

  // Expand bounds slightly to include features that might be partially visible
  const expandedBounds = {
    northEast: {
      latitude: bounds.northEast.latitude + 0.01,
      longitude: bounds.northEast.longitude + 0.01
    },
    southWest: {
      latitude: bounds.southWest.latitude - 0.01,
      longitude: bounds.southWest.longitude - 0.01
    }
  };
  const filteredFeatures = geojson.features.filter((feature, index) => {
    // Skip every other feature for better performance on mobile
    if (index % 2 !== 0 && geojson.features.length > 50) return false;
    
    if (!feature.geometry?.coordinates) return false;

    // For polygons, check if any coordinate is within bounds
    const coordinates = feature.geometry.coordinates[0] || [];
    return coordinates.some(coord => 
      isPointInBounds({ latitude: coord[1], longitude: coord[0] }, expandedBounds)
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
 * @param {number} wait - Wait time in milliseconds (default 300)
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
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

/**
 * Throttle function to limit frequent calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if a feature should be rendered based on zoom level and complexity
 * @param {Object} feature - GeoJSON feature
 * @param {number} zoomLevel - Current map zoom level (0-20)
 * @returns {boolean} Whether to render the feature
 */
export const shouldRenderFeature = (feature, zoomLevel = 10) => {
  if (!feature.geometry?.coordinates) return false;
  
  // At low zoom levels, only render larger/simpler features
  if (zoomLevel < 8) {
    const coords = feature.geometry.coordinates[0] || [];
    return coords.length < 50; // Only simple polygons at low zoom
  }
  
  // At medium zoom levels, render most features
  if (zoomLevel < 12) {
    const coords = feature.geometry.coordinates[0] || [];
    return coords.length < 100;
  }
  
  // At high zoom levels, render all features
  return true;
};