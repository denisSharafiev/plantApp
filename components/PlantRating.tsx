import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlantRatings } from '../types/plant';

interface PlantRatingProps {
  ratings?: PlantRatings;
  onRatingChange: (ratings: PlantRatings) => void;
  editable?: boolean;
}

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

export const PlantRating: React.FC<PlantRatingProps> = ({
  ratings,
  onRatingChange,
  editable = true,
}) => {
  const [currentRatings, setCurrentRatings] = useState<PlantRatings>(
    ratings || {
      germinationSpeed: 0,
      maintenance: 0,
      aroma: 0,
      flowerCount: 0,
      flowerVolume: 0,
      vegSpeed: 0,
      bloomSpeed: 0,
      totalYield: 0,
      overallRating: 0,
    }
  );

  const calculateOverallRating = (ratings: Omit<PlantRatings, 'overallRating'>): number => {
    const weights = {
      germinationSpeed: 1,
      maintenance: 0.8,
      aroma: 0.7,
      flowerCount: 1.2,
      flowerVolume: 1.1,
      vegSpeed: 1,
      bloomSpeed: 1,
      totalYield: 1.5,
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const weightedSum = Object.entries(ratings).reduce((sum, [key, value]) => {
      return sum + (value * (weights[key as keyof typeof weights] || 1));
    }, 0);

    return Math.round((weightedSum / totalWeight) * 10) / 10;
  };

  const handleRatingChange = (category: keyof PlantRatings, value: number) => {
    if (!editable) return;

    const newRatings = {
      ...currentRatings,
      [category]: value,
    };

    // Пересчитываем общий рейтинг
    const { overallRating, ...ratingsWithoutOverall } = newRatings;
    newRatings.overallRating = calculateOverallRating(ratingsWithoutOverall);

    setCurrentRatings(newRatings);
    onRatingChange(newRatings);
  };

  const renderStars = (category: keyof PlantRatings, value: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingChange(category, star)}
            disabled={!editable}
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={24}
              color={star <= value ? '#FFD700' : '#CCC'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Рейтинг растения</Text>
      
      {ratingCategories.map(category => (
        <View key={category.key} style={styles.ratingCategory}>
          <View style={styles.categoryHeader}>
            <Ionicons name={category.icon as any} size={20} color="#007AFF" />
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </View>
          {renderStars(category.key as keyof PlantRatings, currentRatings[category.key as keyof PlantRatings] || 0)}
        </View>
      ))}

      <View style={styles.overallRating}>
        <Text style={styles.overallLabel}>Общий рейтинг:</Text>
        <Text style={styles.overallValue}>{currentRatings.overallRating}/5</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingCategory: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overallRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginTop: 20,
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  overallValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});