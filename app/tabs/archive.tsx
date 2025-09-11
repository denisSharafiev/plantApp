import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { deletePlantAtom, loadPlantsAtom, plantsAtom, unarchivePlantAtom } from '../../atoms/plantsAtom';
import { PlantCard } from '../../components/PlantCard';

export default function ArchiveScreen() {
  const router = useRouter();
  const [plants] = useAtom(plantsAtom);
  const loadPlants = useSetAtom(loadPlantsAtom);
  const unarchivePlant = useSetAtom(unarchivePlantAtom);
  const deletePlant = useSetAtom(deletePlantAtom);

  useEffect(() => {
    loadPlants();
  }, []);

  // Фильтруем только архивированные растения
  const archivedPlants = plants.filter(plant => plant.isArchived);

  const handleUnarchivePlant = async (plantId: string) => {
    try {
      await unarchivePlant(plantId);
      Alert.alert('Успех', 'Растение восстановлено из архива');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось восстановить растение');
    }
  };

  const handleDeletePlant = (plantId: string, plantName: string) => {
    Alert.alert(
      'Удаление растения',
      `Вы уверены, что хотите удалить "${plantName}" из архива?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePlant(plantId);
            if (success) {
              Alert.alert('Успех', 'Растение удалено из архива');
            }
          },
        },
      ]
    );
  };

  if (archivedPlants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="archive-outline" size={64} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Архив пуст</Text>
        <Text style={styles.emptyText}>
          Здесь будут отображаться растения, которые вы переместите в архив
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color="#333" 
          onPress={() => router.back()} 
          style={styles.backButton}
        />
        <Text style={styles.title}>Архив растений</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.subtitle}>
        {archivedPlants.length} растение(й) в архиве
      </Text>

      <FlatList
        data={archivedPlants}
        renderItem={({ item }) => (
          <PlantCard 
            plant={item} 
            onDelete={handleDeletePlant}
            showArchiveButton={true}
            onUnarchive={handleUnarchivePlant}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

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
  subtitle: {
    padding: 16,
    fontSize: 16,
    color: '#666',
    backgroundColor: 'white',
    marginBottom: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F2F2F7',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});