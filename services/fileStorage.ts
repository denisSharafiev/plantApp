import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Plant } from '../types/plant';

const PLANTS_FILE = `${FileSystem.documentDirectory}plants.json`;
const PHOTOS_DIR = `${FileSystem.documentDirectory}plants_photos/`;

class FileStorage {
  // Создаем директорию для фото если не существует
  private async ensurePhotosDirExists(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error creating photos directory:', error);
    }
  }

  // Сохраняем фото с камеры
  async saveCameraPhoto(uri: string): Promise<string> {
    try {
      await this.ensurePhotosDirExists();
      
      // Генерируем уникальное имя файла
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        uri + Date.now().toString()
      );
      
      const fileName = `photo_${hash.substr(0, 16)}.jpg`;
      const fileUri = PHOTOS_DIR + fileName;
      
      // Копируем файл из временной директории камеры
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      return fileUri;
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  // Удаляем фото
  async deletePhoto(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }


  // Удаляем все фото растения
  async deletePlantPhotos(photoUris: string[]): Promise<void> {
    try {
      if (!photoUris || photoUris.length === 0) {
        return; // Ничего не делаем если массив пустой или undefined
      }
      
      for (const uri of photoUris) {
        await this.deletePhoto(uri);
      }
    } catch (error) {
      console.error('Error deleting plant photos:', error);
    }
  }

  // Основные методы работы с растениями (getPlants, addPlant, updatePlant, deletePlant)
  // остаются аналогичными предыдущей версии, но с обновленной структурой Plant
  async getPlants(): Promise<Plant[]> {
    try {
      const exists = await this.fileExists(PLANTS_FILE);
      if (!exists) {
        return [];
      }
      
      const content = await FileSystem.readAsStringAsync(PLANTS_FILE);
      const plants = JSON.parse(content) as Plant[];
      
      // Мигрируем старые данные
      return await this.migratePlants(plants);
    } catch (error) {
      console.error('Error reading plants:', error);
      return [];
    }
  }

  // В методе addPlant обновляем создание нового растения:
  async addPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
    try {
      const plants = await this.getPlants();
      
      const newPlant: Plant = {
        ...plant,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Добавляем начальную фазу если её нет
        phases: plant.phases || [{
          stage: plant.currentStage,
          startDate: plant.plantingDate
        }]
      };

      const updatedPlants = [...plants, newPlant];
      await this.savePlants(updatedPlants);
      
      return newPlant;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  }

  // Метод updatePlant уже должен поддерживать любые поля растения
  async updatePlant(id: string, updates: Partial<Plant>): Promise<Plant | null> {
    try {
      const plants = await this.getPlants();
      const index = plants.findIndex(plant => plant.id === id);
      
      if (index === -1) return null;

      const updatedPlant = { 
        ...plants[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      plants[index] = updatedPlant;

      await this.savePlants(plants);
      return updatedPlant;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  }

  async deletePlant(id: string): Promise<boolean> {
    try {
      const plants = await this.getPlants();
      const plantToDelete = plants.find(plant => plant.id === id);
      
      if (plantToDelete) {
        // Удаляем фото растения (если они есть)
        if (plantToDelete.photos && plantToDelete.photos.length > 0) {
          await this.deletePlantPhotos(plantToDelete.photos);
        }
      }

      const filteredPlants = plants.filter(plant => plant.id !== id);
      await this.savePlants(filteredPlants);
      
      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  }

  private async fileExists(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists ?? false;
    } catch (error) {
      return false;
    }
  }

  private async savePlants(plants: Plant[]): Promise<void> {
    await FileSystem.writeAsStringAsync(PLANTS_FILE, JSON.stringify(plants));
  }

  private async migratePlants(plants: any[]): Promise<Plant[]> {
    return plants.map(plant => {
      // Если у растения старая структура (со полем stage вместо currentStage)
      if (plant.stage && !plant.currentStage) {
        return {
          ...plant,
          currentStage: plant.stage,
          phases: plant.phases || [{
            stage: plant.stage,
            startDate: plant.plantingDate
          }]
        };
      }
      return plant;
    });
  }
}

export const fileStorage = new FileStorage();