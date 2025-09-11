import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Plant } from '../types/plant';

interface PlantCardProps {
  plant: Plant;
  onDelete?: (plantId: string, plantName: string) => void;
  showArchiveButton?: boolean;
  onArchive?: (plantId: string) => void;
  onUnarchive?: (plantId: string) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  onDelete, 
  showArchiveButton = false,
  onArchive,
  onUnarchive,
}) => {
  // Рассчитываем количество дней с посадки
  const getDaysSincePlanting = () => {
    const plantingDate = new Date(plant.plantingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - plantingDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSincePlanting = getDaysSincePlanting();
  const progressPercentage = Math.min((daysSincePlanting / plant.expectedDays) * 100, 100);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'прорастание': return '#FF9500';
      case 'рассада': return '#34C759';
      case 'вегетация': return '#5856D6';
      case 'цветение': return '#FF2D55';
      case 'урожай готов!': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.card}>
      <Link href={`/plant/${plant.id}`} asChild>
        <TouchableOpacity>
          {/* Заголовок с фото и названием */}
          <View style={styles.header}>
            {plant.avatarPhoto ? (
              <Image source={{ uri: plant.avatarPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="leaf-outline" size={24} color="#8E8E93" />
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{plant.name}</Text>
              <Text style={styles.species}>{plant.species}</Text>
            </View>
          </View>

          {/* Информация о прогрессе */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.daysText}>{daysSincePlanting} день</Text>
              <Text style={styles.expectedDaysText}>из {plant.expectedDays}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%`, backgroundColor: getStageColor(plant.stage) }
                ]} 
              />
            </View>
          </View>

          {/* Стадия */}
          <View style={styles.stageBadge}>
            <View 
              style={[
                styles.stageDot,
                { backgroundColor: getStageColor(plant.stage) }
              ]} 
            />
            <Text style={styles.stageText}>{plant.stage}</Text>
          </View>

          {/* Даты */}
          <View style={styles.dates}>
            <Text style={styles.dateText}>
              Посадка: {new Date(plant.plantingDate).toLocaleDateString('ru-RU')}
            </Text>
            {plant.germinationDate && (
              <Text style={styles.dateText}>
                Прорастание: {new Date(plant.germinationDate).toLocaleDateString('ru-RU')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Link>

      {/* Кнопки действий */}
      <View style={styles.actions}>
        {onDelete && (
          <TouchableOpacity 
            onPress={() => onDelete(plant.id, plant.name)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        )}
        
        {showArchiveButton && !plant.isArchived && (
          <TouchableOpacity 
            onPress={() => onArchive?.(plant.id)}
            style={styles.actionButton}
          >
            <Ionicons name="archive-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
        
        {showArchiveButton && plant.isArchived && (
          <TouchableOpacity 
            onPress={() => onUnarchive?.(plant.id)}
            style={styles.actionButton}
          >
            <Ionicons name="archive" size={20} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  species: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  daysText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expectedDaysText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dates: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
});