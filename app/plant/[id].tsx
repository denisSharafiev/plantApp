import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { archivePlantAtom, plantsAtom, updatePlantStageAtom } from '../../atoms/plantsAtom';
import { StageToggle } from '../../components/StageToggle';
import { PlantStage } from '../../types/plant';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [plants] = useAtom(plantsAtom);
  const updatePlantStage = useSetAtom(updatePlantStageAtom);
  const archivePlant = useSetAtom(archivePlantAtom);

  const plant = plants.find(p => p.id === id);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Растение не найдено</Text>
      </View>
    );
  }

  const handleStageToggle = async (stage: PlantStage, dateField: keyof typeof plant) => {
    try {
      await updatePlantStage({ id: plant.id, stage, dateField });
      Alert.alert('Успех', `Стадия обновлена на "${stage}"`);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить стадию');
    }
  };

  const handleArchive = async () => {
    try {
      await archivePlant(plant.id);
      Alert.alert('Успех', 'Растение перемещено в архив');
      router.back();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось переместить в архив');
    }
  };

  const confirmArchive = () => {
    Alert.alert(
      'Переместить в архив',
      `Вы уверены, что хотите переместить "${plant.name}" в архив?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Переместить', style: 'destructive', onPress: handleArchive },
      ]
    );
  };

  const getDaysSince = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{plant.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Основное фото */}
      {plant.photos.length > 0 && (
        <View style={styles.mainPhotoContainer}>
          <Image 
            source={{ uri: plant.photos[selectedPhotoIndex] }} 
            style={styles.mainPhoto}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Миниатюры фото */}
      {plant.photos.length > 1 && (
        <FlatList
          data={plant.photos}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => setSelectedPhotoIndex(index)}>
              <Image 
                source={{ uri: item }} 
                style={[
                  styles.thumbnail,
                  index === selectedPhotoIndex && styles.thumbnailSelected
                ]}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      {/* Информация */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Вид:</Text>
          <Text style={styles.infoValue}>{plant.species}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Заявленный срок:</Text>
          <Text style={styles.infoValue}>{plant.expectedDays} дней</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Стадия:</Text>
          <View style={[styles.stageBadge, { backgroundColor: getStageColor(plant.stage) + '20' }]}>
            <View style={[styles.stageDot, { backgroundColor: getStageColor(plant.stage) }]} />
            <Text style={[styles.stageText, { color: getStageColor(plant.stage) }]}>
              {plant.stage}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Дата посадки:</Text>
          <Text style={styles.infoValue}>
            {new Date(plant.plantingDate).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        {plant.germinationDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата прорастания:</Text>
            <Text style={styles.infoValue}>
              {new Date(plant.germinationDate).toLocaleDateString('ru-RU')}
              {` (${getDaysSince(plant.germinationDate)} дней назад)`}
            </Text>
          </View>
        )}

        {plant.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Заметки:</Text>
            <Text style={styles.infoValue}>{plant.notes}</Text>
          </View>
        )}
      </View>

      {/* Управление стадиями */}
      <View style={styles.stagesSection}>
        <Text style={styles.sectionTitle}>Управление стадиями</Text>

        <StageToggle
          label="Прорастание"
          isActive={!!plant.germinationDate}
          onToggle={() => handleStageToggle('прорастание', 'germinationDate')}
          disabled={!!plant.germinationDate}
        />

        <StageToggle
          label="Рассада"
          isActive={!!plant.transplantDate}
          onToggle={() => handleStageToggle('рассада', 'transplantDate')}
          disabled={!!plant.transplantDate || !plant.germinationDate}
        />

        <StageToggle
          label="Вегетация"
          isActive={!!plant.vegetationDate}
          onToggle={() => handleStageToggle('вегетация', 'vegetationDate')}
          disabled={!!plant.vegetationDate || !plant.transplantDate}
        />

        <StageToggle
          label="Цветение"
          isActive={!!plant.floweringDate}
          onToggle={() => handleStageToggle('цветение', 'floweringDate')}
          disabled={!!plant.floweringDate || !plant.vegetationDate}
        />

        <StageToggle
          label="Сбор урожая"
          isActive={!!plant.harvestDate}
          onToggle={() => handleStageToggle('урожай готов!', 'harvestDate')}
          disabled={!!plant.harvestDate || !plant.floweringDate}
        />
      </View>

      {/* Кнопка архива */}
      {!plant.isArchived && (
        <TouchableOpacity style={styles.archiveButton} onPress={confirmArchive}>
          <Ionicons name="archive-outline" size={20} color="#8E8E93" />
          <Text style={styles.archiveButtonText}>Переместить в архив</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// Вспомогательная функция для цвета стадии
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  mainPhotoContainer: {
    height: 300,
    backgroundColor: '#000',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  thumbnailsContainer: {
    padding: 16,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#007AFF',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
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
  },
  stagesSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  archiveButtonText: {
    marginLeft: 8,
    color: '#8E8E93',
    fontWeight: '600',
  },
});