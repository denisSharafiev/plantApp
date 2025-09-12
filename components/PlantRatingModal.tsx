import { Ionicons } from '@expo/vector-icons';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { updatePlantAtom } from '../atoms/plantsAtom';
import { Plant, PlantRatings } from '../types/plant';

interface PlantRatingModalProps {
  visible: boolean;
  onClose: () => void;
  plant: Plant;
}

export const PlantRatingModal: React.FC<PlantRatingModalProps> = ({
  visible,
  onClose,
  plant,
}) => {
  const updatePlant = useSetAtom(updatePlantAtom);
  const [ratings, setRatings] = useState<PlantRatings>(plant.ratings || {
    germinationSpeed: 0,
    maintenance: 0,
    aroma: 0,
    flowerCount: 0,
    flowerVolume: 0,
    vegSpeed: 0,
    bloomSpeed: 0,
    totalYield: 0,
    overallRating: 0,
  });

  // Обновляем рейтинги при изменении растения
  useEffect(() => {
    if (plant.ratings) {
      setRatings(plant.ratings);
    }
  }, [plant.ratings]);

  // Категории рейтинга с иконками
  const ratingCategories = [
    { key: 'germinationSpeed', label: 'Скорость пророста', icon: 'flash' },
    { key: 'maintenance', label: 'Прихотливость', icon: 'settings' },
    { key: 'aroma', label: 'Аромат', icon: 'flower' },
    { key: 'flowerCount', label: 'Количество соцветий', icon: 'apps' },
    { key: 'flowerVolume', label: 'Объём соцветий', icon: 'resize' },
    { key: 'vegSpeed', label: 'Скорость веги', icon: 'speedometer' },
    { key: 'bloomSpeed', label: 'Скорость цветения', icon: 'time' },
    { key: 'totalYield', label: 'Общий урожай', icon: 'basket' },
  ];

  // Расчет общего рейтинга
  const calculateOverallRating = (currentRatings: Omit<PlantRatings, 'overallRating'>): number => {
    const weights = {
      germinationSpeed: 1.0,
      maintenance: 0.8,
      aroma: 0.7,
      flowerCount: 1.2,
      flowerVolume: 1.1,
      vegSpeed: 1.0,
      bloomSpeed: 1.0,
      totalYield: 1.5,
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const weightedSum = Object.entries(currentRatings).reduce((sum, [key, value]) => {
      return sum + (value * (weights[key as keyof typeof weights] || 1));
    }, 0);

    return Math.round((weightedSum / totalWeight) * 10) / 10;
  };

  const handleRatingChange = (category: keyof PlantRatings, value: number) => {
    const newRatings = {
      ...ratings,
      [category]: value,
    };

    // Пересчитываем общий рейтинг
    const { overallRating, ...ratingsWithoutOverall } = newRatings;
    newRatings.overallRating = calculateOverallRating(ratingsWithoutOverall);

    setRatings(newRatings);
  };

  const handleSave = async () => {
    try {
      await updatePlant({
        id: plant.id,
        updates: { ratings }
      });

      Alert.alert('Успех', 'Рейтинг сохранен!');
      onClose();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить рейтинг');
      console.error('Error saving rating:', error);
    }
  };

  const renderStars = (category: keyof PlantRatings, value: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingChange(category, star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={28}
              color={star <= value ? '#FFD700' : '#CCC'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.title}>Оценка растения</Text>
            <Text style={styles.plantName}>{plant.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Категории рейтинга */}
            {ratingCategories.map(category => (
              <View key={category.key} style={styles.ratingCategory}>
                <View style={styles.categoryHeader}>
                  <Ionicons name={category.icon as any} size={20} color="#007AFF" />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.ratingValue}>
                    {ratings[category.key as keyof PlantRatings]}
                  </Text>
                </View>
                {renderStars(category.key as keyof PlantRatings, ratings[category.key as keyof PlantRatings])}
              </View>
            ))}

            {/* Общий рейтинг */}
            <View style={styles.overallRating}>
              <Text style={styles.overallLabel}>Общий рейтинг:</Text>
              <View style={styles.overallScore}>
                <Ionicons name="star" size={32} color="#FFD700" />
                <Text style={styles.overallValue}>{ratings.overallRating}/5</Text>
              </View>
            </View>

            {/* Кнопки */}
            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 4,
  },
  plantName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  ratingCategory: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 20,
    textAlign: 'right',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  starButton: {
    padding: 4,
  },
  overallRating: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  overallScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});