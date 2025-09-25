import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../config/theme';
import { getPasswordStrength } from '../../utils/validation';

const PasswordStrengthIndicator = ({ password, style }) => {
  const { strength, score, color, checks } = getPasswordStrength(password);

  if (!password) return null;

  const renderCheck = (label, isValid, key) => (
    <View key={key} style={styles.checkItem}>
      <Ionicons 
        name={isValid ? 'checkmark-circle' : 'close-circle'} 
        size={16} 
        color={isValid ? theme.colors.success : theme.colors.error} 
      />
      <Text style={[styles.checkText, { color: isValid ? theme.colors.success : theme.colors.error }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>Password Strength: </Text>
        <Text style={[styles.strengthValue, { color }]}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </Text>
      </View>
      
      <View style={styles.strengthBar}>
        <View 
          style={[
            styles.strengthFill, 
            { 
              width: `${(score / 5) * 100}%`, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>

      <View style={styles.checksContainer}>
        {renderCheck('At least 8 characters', checks?.length, 'length')}
        {renderCheck('One lowercase letter (a-z)', checks?.lowercase, 'lowercase')}
        {renderCheck('One uppercase letter (A-Z)', checks?.uppercase, 'uppercase')}
        {renderCheck('One number (0-9)', checks?.number, 'number')}
        {renderCheck('One special character (!@#$%^&*)', checks?.special, 'special')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm + 4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  strengthLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
  },
  strengthValue: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.semibold,
    textTransform: 'capitalize',
  },
  strengthBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm + 4,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  checksContainer: {
    gap: theme.spacing.xs + 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkText: {
    marginLeft: theme.spacing.xs + 2,
    fontSize: theme.fonts.sizes.xs,
    flex: 1,
  },
});

export default PasswordStrengthIndicator;