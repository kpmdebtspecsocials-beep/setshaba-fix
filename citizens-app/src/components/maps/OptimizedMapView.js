import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { theme } from '../../config/theme';
import { useGeoJSON } from '../../hooks/useGeoJSON';
import { debounce, renderGeoJSONPolygons } from '../../utils/geoUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const { width, height } = Dimensions.get('window');

const OptimizedMapView = ({
  initialRegion = {
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  },
  markers = [],
  onMarkerPress,
  onMapPress,
  showWards = true,
  onWardPress,
  style,
  children,
  ...mapProps
}) => {
  const [mapBounds, setMapBounds] = useState(null);
  const [currentRegion, setCurrentRegion] = useState(initialRegion);
  const mapRef = useRef(null);

  // Load GeoJSON with bounds filtering for performance
  const { geoJsonData, loading, error, refreshGeoJSON } = useGeoJSON(
    mapBounds,
    0.002 // Simplification tolerance - adjust based on performance needs
  );

  // Debounced region change handler to avoid excessive API calls
  const debouncedRegionChange = useMemo(
    () => debounce((region) => {
      setCurrentRegion(region);
      
      // Calculate bounds for GeoJSON filtering
      const bounds = {
        northEast: {
          latitude: region.latitude + region.latitudeDelta / 2,
          longitude: region.longitude + region.longitudeDelta / 2,
        },
        southWest: {
          latitude: region.latitude - region.latitudeDelta / 2,
          longitude: region.longitude - region.longitudeDelta / 2,
        },
      };
      
      setMapBounds(bounds);
    }, 300),
    []
  );

  const handleRegionChangeComplete = useCallback((region) => {
    debouncedRegionChange(region);
  }, [debouncedRegionChange]);

  // Memoized ward polygons using native Polygon components
  const wardPolygons = useMemo(() => {
    if (!showWards || !geoJsonData || loading) return null;

    const polygons = renderGeoJSONPolygons(geoJsonData, {
      strokeColor: theme.colors.primary,
      fillColor: 'rgba(33, 150, 243, 0.1)',
      strokeWidth: 1,
      onPress: onWardPress || ((feature) => {
        console.log('Ward selected:', feature.properties);
      }),
    });

    return polygons.map((polygon) => (
      <Polygon
        key={polygon.id}
        coordinates={polygon.coordinates}
        strokeColor={polygon.strokeColor}
        fillColor={polygon.fillColor}
        strokeWidth={polygon.strokeWidth}
        onPress={polygon.onPress}
        tappable={!!polygon.onPress}
      />
    ));
  }, [geoJsonData, showWards, loading]);

  // Memoized markers for performance
  const renderedMarkers = useMemo(() => {
    return markers.map((marker, index) => (
      <Marker
        key={marker.id || index}
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        description={marker.description}
        pinColor={marker.color || theme.colors.primary}
        onPress={() => onMarkerPress && onMarkerPress(marker)}
      />
    ));
  }, [markers, onMarkerPress]);

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <ErrorMessage
          message={`Map loading failed: ${error}`}
          onRetry={refreshGeoJSON}
          retryText="Retry"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={onMapPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        loadingEnabled={true}
        loadingIndicatorColor={theme.colors.primary}
        mapType="standard"
        pitchEnabled={false} // Disable 3D for better performance
        rotateEnabled={false} // Disable rotation for better performance
        {...mapProps}
      >
        {wardPolygons}
        {renderedMarkers}
        {children}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Loading map data..." />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(OptimizedMapView);