import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { Alert, FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { deletePlantAtom, loadPlantsAtom, plantsAtom } from '../../atoms/plantsAtom';
import { PlantCard } from '../../components/PlantCard';

export default function HomeScreen() {
  const [plants] = useAtom(plantsAtom);
  const loadPlants = useSetAtom(loadPlantsAtom);
  const deletePlant = useSetAtom(deletePlantAtom);

  useEffect(() => {
    loadPlants();
  }, []);

  // Фильтруем только неархивированные растения
  const activePlants = plants.filter(plant => !plant.isArchived);

  const handleDeletePlant = (plantId: string, plantName: string) => {
    Alert.alert(
      'Удаление растения',
      `Вы уверены, что хотите удалить "${plantName}"?`,
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
              Alert.alert('Успех', 'Растение удалено');
            }
          },
        },
      ]
    );
  };

  // Если растений нет, показываем welcome-экран
  if (activePlants.length === 0) {
    return (
      <ImageBackground
        source={require('../../assets/images/100024379685b3.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>Добро пожаловать!</Text>
            <Text style={styles.subtitle}>
              Это ваше приложение для ухода за растениями
            </Text>
            <Link href='/tabs/add' style={styles.button}>
              <Text style={styles.buttonText}>Добавьте первое растение</Text>
            </Link>
            
            {/* Ссылка на архив если есть архивированные растения */}
            {plants.some(plant => plant.isArchived) && (
              <Link href='/tabs/archive' style={styles.archiveLink}>
                <Ionicons name="archive" size={16} color="#32CD32" />
                <Text style={styles.archiveLinkText}>Перейти в архив</Text>
              </Link>
            )}
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Если есть растения, показываем список
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои растения</Text>
        
        {/* Ссылка на архив если есть архивированные растения */}
        {/* {plants.some(plant => plant.isArchived) && (
          <Link href='/tabs/archive' style={styles.archiveButton}>
            <Ionicons name="archive" size={20} color="#32CD32" />
            <Text style={styles.archiveButtonText}>Архив</Text>
          </Link>
        )} */}
      </View>
      
      <FlatList
        data={activePlants}
        renderItem={({ item }) => (
          <PlantCard 
            plant={item} 
            onDelete={handleDeletePlant}
            showArchiveButton={true}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    margin: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#00FF7F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  archiveLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  archiveLinkText: {
    marginLeft: 8,
    color: '#32CD32',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  archiveButtonText: {
    marginLeft: 4,
    color: '#32CD32',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
});