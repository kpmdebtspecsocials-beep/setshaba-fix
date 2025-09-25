import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

const Header = ({ 
  title = 'Setshaba Connect', 
  showLogo = true, 
  rightButton = null,
  onRightButtonPress = null,
  rightButtonIcon = 'add',
  backgroundColor = theme.colors.primary 
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.leftSection}>
        {showLogo && (
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {rightButton && (
        <TouchableOpacity 
          style={styles.rightButton} 
          onPress={onRightButtonPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={rightButtonIcon} 
            size={24} 
            color={theme.colors.white} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    ...theme.shadows.small,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.white,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;