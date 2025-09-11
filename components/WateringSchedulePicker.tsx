import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WateringSchedule } from '../types/plant';

interface WateringSchedulePickerProps {
  value: WateringSchedule;
  onChange: (schedule: WateringSchedule) => void;
}

const wateringOptions: { value: WateringSchedule; label: string }[] = [
  { value: 'daily', label: 'Ежедневно' },
  { value: '2days', label: 'Каждые 2 дня' },
  { value: '3days', label: 'Каждые 3 дня' },
  { value: '4days', label: 'Каждые 4 дня' },
  { value: '5days', label: 'Каждые 5 дней' },
  { value: '6days', label: 'Каждые 6 дней' },
  { value: '7days', label: 'Раз в неделю' },
];

export const WateringSchedulePicker: React.FC<WateringSchedulePickerProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>График полива *</Text>
      <View style={styles.optionsContainer}>
        {wateringOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.optionSelected
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[
              styles.optionText,
              value === option.value && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 100,
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});