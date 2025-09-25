import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { theme } from '../../config/theme';
import { useGeoJSON } from '../../hooks/useGeoJSON';
import { debounce, throttle, renderGeoJSONPolygons, shouldRenderFeature } from '../../utils/geoUtils';
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
  const [zoomLevel, setZoomLevel] = useState(10);
  const mapRef = useRef(null);

  // Load GeoJSON with bounds filtering for performance
  const { geoJsonData, loading, error, refreshGeoJSON } = useGeoJSON(
    mapBounds,
    Platform.OS === 'ios' ? 0.003 : 0.008 // Higher simplification for Android
  );

  // Calculate zoom level from region
  const calculateZoomLevel = useCallback((region) => {
    const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
    return Math.max(1, Math.min(20, zoom));
  }, []);

  // Throttled region change handler for better performance
  const throttledRegionChange = useMemo(
    () => throttle((region) => {
      setCurrentRegion(region);
      setZoomLevel(calculateZoomLevel(region));
      
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
    }, Platform.OS === 'ios' ? 100 : 200), // Faster throttling on iOS
    [calculateZoomLevel]
  );

  const handleRegionChangeComplete = useCallback((region) => {
    throttledRegionChange(region);
  }, [throttledRegionChange]);

  // Highly optimized ward polygons with zoom-based filtering
  const wardPolygons = useMemo(() => {
    if (!showWards || !geoJsonData || loading) return null;

    // Limit number of polygons based on device performance
    const maxPolygons = Platform.OS === 'ios' ? 50 : 25;
    
    const polygons = renderGeoJSONPolygons(geoJsonData, {
      strokeColor: theme.colors.primary,
      fillColor: Platform.OS === 'ios' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)', // Less opacity on Android
      strokeWidth: 1,
      onPress: onWardPress || ((feature) => {
        console.log('Ward selected:', feature.properties);
      }),
    });

    // Filter polygons based on zoom level and device capabilities
    const filteredPolygons = polygons
      .filter(polygon => shouldRenderFeature(polygon.feature, zoomLevel))
      .slice(0, maxPolygons);

    return filteredPolygons.map((polygon) => (
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
  }, [geoJsonData, showWards, loading, zoomLevel, onWardPress]);

  // Memoized markers for performance
  const renderedMarkers = useMemo(() => {
    // Limit markers on low-end devices
    const maxMarkers = Platform.OS === 'ios' ? markers.length : Math.min(markers.length, 20);
    const limitedMarkers = markers.slice(0, maxMarkers);
    
    return limitedMarkers.map((marker, index) => (
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
        showsMyLocationButton={Platform.OS === 'ios'} // Disable on Android for performance
        loadingEnabled={true}
        loadingIndicatorColor={theme.colors.primary}
        mapType="standard"
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        // Performance optimizations
        maxZoomLevel={18}
        minZoomLevel={6}
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        {...mapProps}
      >
        {wardPolygons}
        {renderedMarkers}
        {children}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Loading map..." size="small" />
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
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
});

export default React.memo(OptimizedMapView);