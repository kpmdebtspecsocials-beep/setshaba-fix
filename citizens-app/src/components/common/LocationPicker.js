import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { theme } from '../../config/theme';
import { useLocation } from '../../hooks/useLocation';
import { useWards } from '../../hooks/useWards';
import { debounce } from '../../utils/geoUtils';

const { width, height } = Dimensions.get('window');

const LocationPicker = ({
  initialLocation = null,
  onLocationChange,
  enableAutocomplete = false,
  showMap = true,
  style,
  mapHeight = 200,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: initialLocation?.latitude || -26.2041,
    longitude: initialLocation?.longitude || 28.0473,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);
  const [showMapView, setShowMapView] = useState(showMap);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);

  const { getCurrentLocation, reverseGeocode } = useLocation();
  const { findWardByLocation } = useWards();

  // Initialize with provided location
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapRegion({
        ...mapRegion,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      });
      // Get address for initial location
      reverseGeocodeLocation(initialLocation);
    }
  }, [initialLocation]);

  // Debounced reverse geocoding
  const debouncedReverseGeocode = useMemo(
    () => debounce(reverseGeocodeLocation, 500),
    []
  );

  const reverseGeocodeLocation = async (location) => {
    try {
      const addressText = await reverseGeocode(location.latitude, location.longitude);
      setAddress(addressText);
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      
      const newLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      setSelectedLocation(newLocation);
      setMapRegion({
        ...mapRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Get address for current location
      await reverseGeocodeLocation(newLocation);

      // Notify parent component
      if (onLocationChange) {
        onLocationChange({
          ...newLocation,
          address: address || 'Current location',
        });
      }
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please ensure location permissions are enabled.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = useCallback((event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    
    setSelectedLocation(newLocation);
    
    // Find ward for the selected location
    const ward = findWardByLocation(latitude, longitude);
    setSelectedWard(ward);
    
    debouncedReverseGeocode(newLocation);

    // Notify parent component
    if (onLocationChange) {
      onLocationChange({
        ...newLocation,
        ward,
        address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    }
  }, [address, onLocationChange, debouncedReverseGeocode, findWardByLocation]);

  const handleAddressChange = (text) => {
    setAddress(text);
    
    // Simple address validation and geocoding could be added here
    // For now, we'll just update the address
    if (selectedLocation && onLocationChange) {
      onLocationChange({
        ...selectedLocation,
        address: text,
      });
    }

    // If autocomplete is enabled, you could add API calls here
    if (enableAutocomplete && text.length > 2) {
      // Placeholder for autocomplete API calls
      // This would integrate with Google Places API or similar
      console.log('Autocomplete search for:', text);
    }
  };

  // Update ward when location changes
  useEffect(() => {
    if (selectedLocation) {
      const ward = findWardByLocation(selectedLocation.latitude, selectedLocation.longitude);
      setSelectedWard(ward);
      
      if (onLocationChange) {
        onLocationChange({
          ...selectedLocation,
          ward,
          address,
        });
      }
    }
  }, [selectedLocation, findWardByLocation, address, onLocationChange]);
  const toggleMapView = () => {
    setShowMapView(!showMapView);
  };

  const renderMap = () => {
    if (!showMapView) return null;

    return (
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          loadingEnabled={true}
          loadingIndicatorColor={theme.colors.primary}
          mapType="standard"
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description={address || 'Tap to select location'}
              pinColor={theme.colors.primary}
            />
          )}
        </MapView>
        
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color={theme.colors.white} />
          ) : (
            <Ionicons name="locate" size={20} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>Location</Text>
        {showMap && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMapView}
          >
            <Ionicons
              name={showMapView ? 'map' : 'map-outline'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.toggleText}>
              {showMapView ? 'Hide Map' : 'Show Map'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Input
        value={address}
        onChangeText={handleAddressChange}
        placeholder="Enter address or tap on map"
        multiline
        numberOfLines={2}
        style={styles.addressInput}
      />

      {renderMap()}

      <View style={styles.actions}>
        <Button
          title="Use Current Location"
          onPress={handleGetCurrentLocation}
          loading={loading}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        
        {selectedLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.coordinates}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
            {selectedWard && (
              <Text style={styles.wardInfo}>
                {selectedWard.name} • {selectedWard.municipality}
              </Text>
            )}
          </View>
        )}
      </View>

      {addressSuggestions.length > 0 && (
        <View style={styles.suggestions}>
          {addressSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setAddress(suggestion.description);
                setAddressSuggestions([]);
                // Handle suggestion selection
              }}
            >
              <Text style={styles.suggestionText}>{suggestion.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  toggleText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
  },
  addressInput: {
    marginBottom: theme.spacing.sm,
  },
  mapContainer: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  coordinates: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  locationInfo: {
    alignItems: 'flex-end',
  },
  wardInfo: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.medium,
    marginTop: theme.spacing.xs / 2,
  },
  suggestions: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  suggestionItem: {
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
  },
});

export default React.memo(LocationPicker);