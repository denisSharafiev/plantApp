import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { plantEventsService } from '../services/plantEventsService';
import { Plant } from '../types/plant';

interface PlantCardProps {
  plant: Plant;
  onDelete?: (plantId: string, plantName: string) => void;
  showArchiveButton?: boolean;
  onArchive?: (plantId: string) => void;
  onUnarchive?: (plantId: string) => void;
}

// Компонент для отображения ближайшего события
const NextEvent: React.FC<{ plantId: string }> = ({ plantId }) => {
  const [nextEvent, setNextEvent] = useState<any>(null);

  useEffect(() => {
    const event = plantEventsService.getNextEvent(plantId);
    setNextEvent(event);
  }, [plantId]);

  if (!nextEvent) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'watering': return '💧';
      case 'feeding': return '🌱';
      case 'pruning': return '✂️';
      case 'transplant': return '🔄';
      case 'harvest': return '📦';
      default: return '📅';
    }
  };

  return (
    <View style={styles.nextEvent}>
      <Text style={styles.nextEventIcon}>{getEventIcon(nextEvent.type)}</Text>
      <Text style={styles.nextEventText}>
        {format(new Date(nextEvent.date), 'dd.MM')} - {nextEvent.title}
      </Text>
    </View>
  );
};

// Компонент для отображения графика полива
const WateringInfo: React.FC<{ schedule: string }> = ({ schedule }) => {
  const getScheduleText = (schedule: string) => {
    const texts = {
      daily: 'Ежедневно',
      '2days': 'Каждые 2 дня',
      '3days': 'Каждые 3 дня',
      '4days': 'Каждые 4 дня',
      '5days': 'Каждые 5 дней',
      '6days': 'Каждые 6 дней',
      '7days': 'Раз в неделю',
    };
    return texts[schedule as keyof typeof texts] || schedule;
  };

  return (
    <View style={styles.wateringInfo}>
      <Ionicons name="water" size={12} color="#007AFF" />
      <Text style={styles.wateringText}>{getScheduleText(schedule)}</Text>
    </View>
  );
};

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

  const handleRatingPress = () => {
    // Здесь будет навигация на страницу рейтинга
    Alert.alert('Рейтинг', 'Функция рейтинга будет реализована в следующем обновлении');
  };

  return (
    <View style={styles.card}>
      <Link href={`/plant/${plant.id}`} asChild>
        <TouchableOpacity style={styles.content}>
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
              
              {/* Ближайшее событие вместо вида */}
              <NextEvent plantId={plant.id} />
              
              {/* График полива */}
              <WateringInfo schedule={plant.wateringSchedule} />
            </View>
          </View>

          {/* Дополнительная информация */}
          <View style={styles.additionalInfo}>
            {plant.seedBank && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={12} color="#666" />
                <Text style={styles.infoText}>{plant.seedBank}</Text>
              </View>
            )}
            {plant.price && (
              <View style={styles.infoRow}>
                <Ionicons name="pricetag" size={12} color="#666" />
                <Text style={styles.infoText}>{plant.price} руб</Text>
              </View>
            )}
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

      {/* Кнопка рейтинга */}
      <TouchableOpacity 
        style={styles.ratingButton}
        onPress={handleRatingPress}
      >
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>Оценить</Text>
      </TouchableOpacity>

      {/* В компонент действий добавляем кнопку календаря: */}
      <View style={styles.actions}>
        {/* Кнопка календаря */}
        <Link href={`/plant/calendar/${plant.id}`} asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>
        </Link>

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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  nextEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextEventIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  nextEventText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wateringText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  additionalInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
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
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
  ratingButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEB3B',
  },
  ratingText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
    marginLeft: 4,
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
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
});