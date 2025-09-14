import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { addPlantAtom } from '../../atoms/plantsAtom';
import { CameraButton } from '../../components/CameraButton';
import { DateTimePicker } from '../../components/DateTimePicker';
import { WateringSchedulePicker } from '../../components/WateringSchedulePicker';
import { fileStorage } from '../../services/fileStorage';
import { plantEventsService } from '../../services/plantEventsService';
import { PlantFormData, PlantStage, WateringSchedule } from '../../types/plant';

interface ExtendedPlantFormData extends PlantFormData {
  avatarPhoto?: string;
  seedBank?: string;
  price?: string;
  wateringSchedule: WateringSchedule;
}

export default function AddScreen() {
  const router = useRouter();
  const addPlant = useSetAtom(addPlantAtom);

  const [formData, setFormData] = useState<ExtendedPlantFormData>({
    name: '',
    species: '',
    seedBank: '',
    price: '',
    expectedDays: '',
    wateringSchedule: '2days',
    stage: 'прорастание',
    plantingDate: new Date().toISOString(),
    photos: [],
    notes: '',
  });

  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const stageOptions = [
    { label: 'Прорастание', value: 'прорастание' },
    { label: 'Рассада', value: 'рассада' },
    { label: 'Вегетация', value: 'вегетация' },
    { label: 'Цветение', value: 'цветение' },
  ];

  const handleAddPhoto = async (photoUri: string) => {
    if (formData.photos.length >= 5) {
      Alert.alert('Ошибка', 'Можно добавить не более 5 фото');
      return;
    }

    try {
      const savedUri = await fileStorage.saveCameraPhoto(photoUri);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, savedUri],
      }));
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить фото');
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    const removedPhoto = newPhotos.splice(index, 1)[0];
    
    fileStorage.deletePhoto(removedPhoto).catch(console.error);
    
    setFormData(prev => ({
      ...prev,
      photos: newPhotos,
      avatarPhoto: prev.avatarPhoto === removedPhoto ? undefined : prev.avatarPhoto,
    }));
  };

  const handleSetAvatar = (index: number) => {
    const selectedPhoto = formData.photos[index];
    setFormData(prev => ({
      ...prev,
      avatarPhoto: prev.avatarPhoto === selectedPhoto ? undefined : selectedPhoto,
    }));
  };

  const handleCancel = () => {
    formData.photos.forEach(photoUri => {
      fileStorage.deletePhoto(photoUri).catch(console.error);
    });
    
    setFormData({
      name: '',
      species: '',
      seedBank: '',
      price: '',
      expectedDays: '',
      wateringSchedule: '7days',
      stage: 'прорастание',
      plantingDate: new Date().toISOString(),
      photos: [],
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.species.trim() || !formData.expectedDays.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните обязательные поля');
      return;
    }

    setLoading(true);

    try {
      const newPlant = await addPlant({
        name: formData.name.trim(),
        species: formData.species.trim(),
        seedBank: formData.seedBank?.trim(),
        price: formData.price ? Number(formData.price) : undefined,
        expectedDays: Number(formData.expectedDays),
        wateringSchedule: formData.wateringSchedule,
        currentStage: formData.stage, // Используем currentStage вместо stage
        phases: [{
          stage: formData.stage,
          startDate: formData.plantingDate
        }],
        plantingDate: formData.plantingDate,
        notes: formData.notes?.trim() || undefined,
        photos: formData.photos,
        avatarPhoto: formData.avatarPhoto,
        isArchived: false,
      });

      // Создаем события полива для нового растения
      await plantEventsService.createWateringEventsForNewPlant(newPlant);

      // ОЧИЩАЕМ ФОРМУ ПОСЛЕ УСПЕШНОГО ДОБАВЛЕНИЯ
      setFormData({
        name: '',
        species: '',
        seedBank: '',
        price: '',
        expectedDays: '',
        wateringSchedule: '7days',
        stage: 'прорастание',
        plantingDate: new Date().toISOString(),
        photos: [],
        notes: '',
      });

      Alert.alert('Успешно', 'Растение успешно добавлено!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить растение');
      console.error('Error adding plant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Добавить новое растение</Text>

        <View style={styles.form}>
          {/* Обязательные поля */}
          <Text style={styles.label}>Название растения *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Например, Томат Черри"
          />

          <Text style={styles.label}>Вид растения *</Text>
          <TextInput
            style={styles.input}
            value={formData.species}
            onChangeText={(text) => setFormData(prev => ({ ...prev, species: text }))}
            placeholder="Например, Томат"
          />

          <Text style={styles.label}>Сидбанк</Text>
          <TextInput
            style={styles.input}
            value={formData.seedBank}
            onChangeText={(text) => setFormData(prev => ({ ...prev, seedBank: text }))}
            placeholder="Например, Dutch Passion"
          />

          <Text style={styles.label}>Цена (руб)</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
            placeholder="Например, 500"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Заявленный срок (дни) *</Text>
          <TextInput
            style={styles.input}
            value={formData.expectedDays}
            onChangeText={(text) => setFormData(prev => ({ ...prev, expectedDays: text }))}
            placeholder="Например, 90"
            keyboardType="numeric"
          />

          <WateringSchedulePicker
            value={formData.wateringSchedule}
            onChange={(schedule) => setFormData(prev => ({ ...prev, wateringSchedule: schedule }))}
          />

          <Text style={styles.label}>Текущая стадия *</Text>
          <DropDownPicker
            open={isStageDropdownOpen}
            value={formData.stage}
            items={stageOptions}
            setOpen={setIsStageDropdownOpen}
            setValue={(callback) => {
              const newValue = typeof callback === 'function' 
                ? callback(formData.stage) 
                : callback;
              setFormData(prev => ({ 
                ...prev, 
                stage: newValue as PlantStage 
              }));
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholder="Выберите стадию"
            listMode="SCROLLVIEW"
          />

          <DateTimePicker
            label="Дата посадки *"
            value={formData.plantingDate}
            onChange={(date) => setFormData(prev => ({ ...prev, plantingDate: date }))}
          />

          {/* Фото */}
          <Text style={styles.label}>Фотографии ({formData.photos.length}/5)</Text>
          <CameraButton
            onPhotoTaken={handleAddPhoto}
            disabled={formData.photos.length >= 5}
          />

          {/* Горизонтальный список фото */}
          {formData.photos.length > 0 && (
            <View style={styles.photosContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {formData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <View style={styles.photoActions}>
                      <TouchableOpacity
                        style={[
                          styles.avatarButton,
                          formData.avatarPhoto === photo && styles.avatarButtonActive
                        ]}
                        onPress={() => handleSetAvatar(index)}
                      >
                        <Ionicons
                          name={formData.avatarPhoto === photo ? 'star' : 'star-outline'}
                          size={16}
                          color={formData.avatarPhoto === photo ? '#FFD700' : '#666'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deletePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                    {formData.avatarPhoto === photo && (
                      <View style={styles.avatarBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Заметки */}
          <Text style={styles.label}>Заметки</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Дополнительная информация о растении"
            multiline
            numberOfLines={4}
          />

          {/* Кнопки */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Добавление...' : 'Добавить растение'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownContainer: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
  },
  photosContainer: {
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -4,
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
    marginHorizontal: 4,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  photoActions: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    gap: 4,
  },
  avatarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  avatarButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  deletePhotoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  avatarBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  submitButton: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});