import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


import {
  archivePlantAtom,
  plantsAtom,
  updatePhaseNotesAtom,
  updatePlantAtom,
  updatePlantPhaseAtom
} from '../../atoms/plantsAtom';
import { CameraButton } from '../../components/CameraButton';
import { PlantPhaseManager } from '../../components/PlantPhaseManager';
import { fileStorage } from '../../services/fileStorage';
// import { plantEventsService } from '../../services/plantEventsService';
import { Plant, PlantPhase, PlantStage } from '../../types/plant';
// import {WateringSchedule} from '../../types/plant';
import { PlantRatingModal } from '../../components/PlantRatingModal';



export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [plants] = useAtom(plantsAtom);
  const updatePlantPhase = useSetAtom(updatePlantPhaseAtom);
  const updatePhaseNotes = useSetAtom(updatePhaseNotesAtom);
  const [, updatePlant] = useAtom(updatePlantAtom);
  const archivePlant = useSetAtom(archivePlantAtom);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const plant = plants.find(p => p.id === id);
  
  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Растение не найдено</Text>
      </View>
    );
  }

  const handleArchive = async () => {
    try {
      await archivePlant(plant.id);
      Alert.alert('Успех', 'Растение перемещено в архив');
      router.back();
      } catch {
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

  // const getDaysSince = (dateString?: string) => {
  //   if (!dateString) return null;
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now.getTime() - date.getTime());
  //   return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // };

  // Добавляем функцию для обновления графика полива
  // const handleWateringScheduleUpdate = async (newSchedule: WateringSchedule) => {
  //   try {
  //     await plantEventsService.updateWateringSchedule(
  //       plant.id,
  //       newSchedule,
  //       plant.plantingDate
  //     );
  //     Alert.alert('Успех', 'График полива обновлен');
  //   } catch (error) {
  //     Alert.alert('Ошибка', 'Не удалось обновить график полива');
  //     console.error('Error updating watering schedule:', error);
  //   }
  // };

  const handleAddPhoto = async (photoUri: string) => {
    // Создаем безопасный массив фотографий
    const currentPhotos = plant.photos || [];
    
    if (currentPhotos.length >= 5) {
      Alert.alert('Ошибка', 'Можно добавить не более 5 фото');
      return;
    }

    try {
      const savedPhotoUri = await fileStorage.saveCameraPhoto(photoUri);
      const updatedPhotos = [...currentPhotos, savedPhotoUri];
      
      // Если это первое фото, устанавливаем его как аватарку
      const updates: Partial<Plant> = { photos: updatedPhotos };
      if (updatedPhotos.length === 1) {
        updates.avatarPhoto = savedPhotoUri;
        updates.photo = savedPhotoUri;
      }
      
      await updatePlant({ id: plant.id, updates });
      
      Alert.alert('Успех', 'Фото добавлено');
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить фото');
    }
  };

  const deletePhoto = async (index: number) => {
    try {
      const currentPhotos = plant.photos || [];
      if (currentPhotos.length <= index) return;

      const photoToDelete = currentPhotos[index];
      const updatedPhotos = currentPhotos.filter((_, i) => i !== index);

      // Удаляем фото из хранилища
      await fileStorage.deletePhoto(photoToDelete);
      
      // Проверяем, было ли это фото аватаркой
      const updates: Partial<Plant> = { photos: updatedPhotos };
      if (plant.avatarPhoto === photoToDelete) {
        // Если удаляем аватарку, устанавливаем первую фото как новую аватарку
        updates.avatarPhoto = updatedPhotos[0];
        updates.photo = updatedPhotos[0];
      }
      
      // Обновляем растение
      await updatePlant({ id: plant.id, updates });
      
      Alert.alert('Успех', 'Фото удалено');
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Ошибка', 'Не удалось удалить фото');
    }
  };

  const handleSetAvatar = async (index: number) => {
    try {
      // Проверяем, что photos существует и содержит фото по индексу
      if (!plant.photos || plant.photos.length <= index) {
        Alert.alert('Ошибка', 'Фото не найдено');
        return;
      }

      const avatarPhoto = plant.photos[index];
      
      // Обновляем растение с новой аватаркой
      await updatePlant({ 
        id: plant.id, 
        updates: { 
          avatarPhoto,
          photo: avatarPhoto // Основное фото растения
        } 
      });
      
      Alert.alert('Успех', 'Фото установлено как основное');
    } catch (error) {
      console.error('Error setting avatar:', error);
      Alert.alert('Ошибка', 'Не удалось установить фото как основное');
    }
  };

  // Вспомогательная функция для цвета стадии
  const getStageColor = (stage: PlantStage) => {
    switch (stage) {
      case 'прорастание': return '#FF9500';
      case 'рассада': return '#34C759';
      case 'вегетация': return '#5856D6';
      case 'цветение': return '#FF2D55';
      case 'урожай готов!': return '#AF52DE';
      default: return '#8E8E93';
    }
  };

  // Добавляем функции для работы с фазами
  const handlePhaseChange = async (newStage: PlantStage, startDate: Date, notes?: string) => {
    try {
      await updatePlantPhase({ 
        id: plant.id, 
        newStage, 
        startDate 
      });
      
      Alert.alert('Успех', `Фаза изменена на "${newStage}"`);
    } catch (error) {
      console.error('Error changing phase:', error);
      Alert.alert('Ошибка', 'Не удалось изменить фазу');
    }
  };

  const handlePhaseUpdate = async (phaseIndex: number, updates: Partial<PlantPhase>) => {
    try {
      if (updates.notes !== undefined) {
        await updatePhaseNotes({
          id: plant.id,
          phaseIndex,
          notes: updates.notes
        });
      }
      
      Alert.alert('Успешно', 'Заметки сохранены');
    } catch (error) {
      console.error('Error updating phase:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить заметки');
    }
  };

    const handleRatingPress = () => {
      setIsRatingModalVisible(true);
    };
 
  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{plant.name}</Text>
          
        {/* ОТОБРАЖЕНИЕ РЕЙТИНГА - ВСТАВЛЯЕМ ЗДЕСЬ */}
        {plant.ratings && plant.ratings.overallRating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{plant.ratings.overallRating}</Text>
          </View>
        )}
        {/* Кнопка рейтинга */}
        <TouchableOpacity 
          style={styles.ratingButton}
          onPress={handleRatingPress}
        >
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingButtonText}>Оценить</Text>
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>

      {/* Основное фото */}
      {plant.photos && plant.photos.length > 0 ? (
        <View style={styles.mainPhotoContainer}>
          <Image 
            source={{ uri: plant.avatarPhoto || plant.photos[0] }} 
            style={styles.mainPhoto}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.mainPhotoContainer}>
          <View style={styles.placeholderPhoto}>
            <Ionicons name="leaf-outline" size={64} color="#666" />
            <Text style={styles.placeholderText}>Нет фото</Text>
          </View>
        </View>
      )}

      {/* Миниатюры фото */}
      {/* Горизонтальный список фото */}
      {plant.photos && plant.photos.length > 0 ? (
        <View style={styles.photosContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {(plant.photos || []).map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={[
                      styles.avatarButton,
                      plant.avatarPhoto === photo && styles.avatarButtonActive
                    ]}
                    onPress={() => handleSetAvatar(index)}
                  >
                    <Ionicons
                      name={plant.avatarPhoto === photo ? 'star' : 'star-outline'}
                      size={16}
                      color={plant.avatarPhoto === photo ? '#FFD700' : '#666'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() => deletePhoto(index)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                {plant.avatarPhoto === photo && (
                  <View style={styles.avatarBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.noPhotosText}>Нет добавленных фотографий</Text>
      )}
      <CameraButton
        onPhotoTaken={handleAddPhoto}
        disabled={plant.photos && plant.photos.length >= 5}
      />


      {/* Информация */}
      {/* <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Стадия:</Text>
        <View style={[styles.stageBadge, { backgroundColor: getStageColor(plant.currentStage) + '20' }]}>
          <View style={[styles.stageDot, { backgroundColor: getStageColor(plant.currentStage) }]} />
          <Text style={[styles.stageText, { color: getStageColor(plant.currentStage) }]}>
            {plant.currentStage}
          </Text>
        </View>
      </View> */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Дата посадки:</Text>
        <Text style={styles.infoValue}>
          {new Date(plant.plantingDate).toLocaleDateString('ru-RU')}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Вид:</Text>
        <Text style={styles.infoValue}>{plant.species}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Заявленный срок:</Text>
        <Text style={styles.infoValue}>{plant.expectedDays} дней</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Производитель:</Text>
        <Text style={styles.infoValue}>{plant.seedBank}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Цена:</Text>
        <Text style={styles.infoValue}>{plant.price} руб.</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Текущий график полива:</Text>
        <Text style={styles.infoValue}>Каждые {plant.wateringSchedule}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Комментарий:</Text>
        <Text style={styles.infoValue}>{plant.notes}</Text>
      </View>

      {/* Управление стадиями */}
      <PlantPhaseManager
        currentStage={plant.currentStage}
        phases={plant.phases || []}
        onPhaseChange={handlePhaseChange}
        onPhaseUpdate={handlePhaseUpdate}
      />

      {/* Кнопка архива */}
      {!plant.isArchived && (
        <TouchableOpacity style={styles.archiveButton} onPress={confirmArchive}>
          <Ionicons name="archive-outline" size={20} color="#8E8E93" />
          <Text style={styles.archiveButtonText}>Переместить в архив</Text>
        </TouchableOpacity>
      )}

      {/* Модальное окно рейтинга */}
      <PlantRatingModal
        visible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        plant={plant}
      />
    </ScrollView>
  );
}

  // Вспомогательная функция для цвета стадии
  // const getStageColor = (stage: string) => {
  //   switch (stage) {
  //     case 'прорастание': return '#FF9500';
  //     case 'рассада': return '#34C759';
  //     case 'вегетация': return '#5856D6';
  //     case 'цветение': return '#FF2D55';
  //     case 'урожай готов!': return '#AF52DE';
  //     default: return '#8E8E93';
  //   }
  // };

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
    maxWidth:150
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
    borderColor: '#32CD32',
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
  photosContainer: {
    padding: 10,
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
  noPhotosText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
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
  ratingButtonText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
    marginLeft: 4,
  },
  ratingBadge: {
    position: 'absolute',
    top: 19,
    right: 130,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEB3B',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
    marginLeft: 4,
  },
});