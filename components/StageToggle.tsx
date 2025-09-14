import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StageToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const StageToggle: React.FC<StageToggleProps> = ({
  label,
  isActive,
  onToggle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        isActive && styles.toggleActive,
        disabled && styles.toggleDisabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
    >
      <View style={styles.toggleContent}>
        <Ionicons
          name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isActive ? '#34C759' : disabled ? '#CCC' : '#32CD32'}
        />
        <Text style={[
          styles.label,
          isActive && styles.labelActive,
          disabled && styles.labelDisabled,
        ]}>
          {label}
        </Text>
      </View>
      
      {isActive && (
        <Ionicons name="lock-closed" size={16} color="#34C759" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  toggleActive: {
    backgroundColor: '#F0FFF4',
    borderColor: '#34C759',
  },
  toggleDisabled: {
    opacity: 0.6,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  labelActive: {
    color: '#34C759',
    fontWeight: '600',
  },
  labelDisabled: {
    color: '#999',
  },
});