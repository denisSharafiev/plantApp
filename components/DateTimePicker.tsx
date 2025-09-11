import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface DateTimePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Выберите дату и время',
  label,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleConfirm = (date: Date) => {
    onChange(date.toISOString());
    setIsVisible(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return placeholder;
    
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setIsVisible(true)}
      >
        <Text style={value ? styles.dateText : styles.placeholderText}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>
      
      <DateTimePickerModal
        isVisible={isVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setIsVisible(false)}
        locale="ru_RU"
      />
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
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
});