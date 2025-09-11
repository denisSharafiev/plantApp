import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CameraButtonProps {
  onPhotoTaken: (uri: string) => void;
  disabled?: boolean;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onPhotoTaken,
  disabled = false,
}) => {
  const takePhoto = async () => {
    try {
      // Запрашиваем разрешение на камеру
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение на использование камеры');
        return;
      }

      // Запускаем камеру
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoTaken(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={takePhoto}
      disabled={disabled}
    >
      <Ionicons name="camera" size={24} color={disabled ? '#999' : '#007AFF'} />
      <Text style={[styles.text, disabled && styles.disabledText]}>
        Сделать фото
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  disabled: {
    borderColor: '#CCC',
    backgroundColor: '#F0F0F0',
  },
  text: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
});