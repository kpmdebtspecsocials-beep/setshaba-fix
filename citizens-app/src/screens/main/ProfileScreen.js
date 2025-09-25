import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LocationPicker from '../../components/common/LocationPicker';
import { theme } from '../../config/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import userService from '../../services/userService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    home_address: '',
    lat: null,
    lng: null,
  });
  const { signOut } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUserProfile();
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        home_address: userData.home_address || '',
        lat: userData.lat,
        lng: userData.lng,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      home_address: location.address,
      lat: location.latitude,
      lng: location.longitude,
      ward_id: location.ward?.id || null,
    }));
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      
      const updates = {};
      if (formData.name !== profile.name) {
        updates.name = formData.name.trim();
      }
      if (formData.home_address !== profile.home_address) {
        updates.home_address = formData.home_address.trim();
      }
      if (formData.lat !== profile.lat) {
        updates.lat = formData.lat;
      }
      if (formData.lng !== profile.lng) {
        updates.lng = formData.lng;
      }
      if (formData.ward_id !== profile.ward_id) {
        updates.ward_id = formData.ward_id;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedProfile = await userService.updateUserProfile(updates);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      home_address: profile.home_address || '',
      lat: profile.lat,
      lng: profile.lng,
    });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const navigateToMyReports = () => {
    navigation.navigate('MyReports');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadProfile}
        retryText="Retry"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? 'close' : 'pencil'} 
              size={20} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={theme.colors.white} />
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
          <Text style={styles.role}>Citizen</Text>
        </View>

        <View style={styles.form}>
          {isEditing ? (
            <>
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                placeholder="Enter your full name"
              />

              <LocationPicker
                initialLocation={
                  formData.lat && formData.lng
                    ? { latitude: formData.lat, longitude: formData.lng }
                    : null
                }
                onLocationChange={handleLocationChange}
                enableAutocomplete={false}
                showMap={true}
                mapHeight={200}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Save"
                  onPress={handleSave}
                  loading={updating}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{profile?.name || 'Not provided'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Home Address</Text>
                <Text style={styles.infoValue}>
                  {profile?.home_address || 'Not provided'}
                </Text>
              </View>

              {profile?.lat && profile?.lng && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Coordinates</Text>
                  <Text style={styles.infoValue}>
                    {profile.lat.toFixed(6)}, {profile.lng.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Municipality</Text>
                <Text style={styles.infoValue}>
                  {profile?.municipalities?.name || 'Not assigned'}
                </Text>
              </View>

              {profile?.ward_id && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Ward</Text>
                  <Text style={styles.infoValue}>
                    {profile.ward_id}
                  </Text>
                </View>
              )}
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profile?.created_at)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToMyReports}
          >
            <Ionicons name="document-text-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>My Reports</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg - 4,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  email: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  role: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  form: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg - 4,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  saveButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoContainer: {
    gap: theme.spacing.lg - 4,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm + 4,
  },
  infoLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    fontWeight: theme.fonts.weights.medium,
  },
  actions: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg - 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    fontWeight: theme.fonts.weights.medium,
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: theme.colors.error,
  },
});

export default ProfileScreen;