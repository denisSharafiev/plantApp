import { atom } from 'jotai';
import { fileStorage } from '../services/fileStorage';
import { plantEventsService } from '../services/plantEventsService';
import { Plant, PlantStage } from '../types/plant';

// Атом для списка растений
export const plantsAtom = atom<Plant[]>([]);

// Атом для загрузки растений
export const loadPlantsAtom = atom(
  null,
  async (get, set) => {
    try {
      const plants = await fileStorage.getPlants();
      set(plantsAtom, plants);
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  }
);

// Атом для добавления растения
export const addPlantAtom = atom(
  null,
  async (get, set, plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlant = await fileStorage.addPlant(plant);
      const currentPlants = get(plantsAtom);
      set(plantsAtom, [...currentPlants, newPlant]);
      return newPlant;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  }
);

// Атом для обновления растения
// Атом для обновления растения должен уже поддерживать любые поля
export const updatePlantAtom = atom(
  null,
  async (get, set, { id, updates }: { id: string; updates: Partial<Plant> }) => {
    try {
      const updatedPlant = await fileStorage.updatePlant(id, updates);
      if (updatedPlant) {
        const currentPlants = get(plantsAtom);
        set(plantsAtom, currentPlants.map(plant => 
          plant.id === id ? updatedPlant : plant
        ));
      }
      return updatedPlant;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  }
);

// Атом для удаления растения
// В атом deletePlantAtom добавляем удаление событий:
export const deletePlantAtom = atom(
  null,
  async (get, set, plantId: string) => {
    try {
      // Удаляем события растения перед удалением самого растения
      await plantEventsService.deletePlantEvents(plantId);
      
      const success = await fileStorage.deletePlant(plantId);
      if (success) {
        const currentPlants = get(plantsAtom);
        set(plantsAtom, currentPlants.filter(plant => plant.id !== plantId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  }
);

// Атом для архивирования растения
export const archivePlantAtom = atom(
  null,
  async (get, set, plantId: string) => {
    try {
      const updatedPlant = await fileStorage.updatePlant(plantId, { isArchived: true });
      if (updatedPlant) {
        const currentPlants = get(plantsAtom);
        set(plantsAtom, currentPlants.map(plant => 
          plant.id === plantId ? updatedPlant : plant
        ));
      }
      return updatedPlant;
    } catch (error) {
      console.error('Error archiving plant:', error);
      throw error;
    }
  }
);

// Атом для восстановления растения из архива
export const unarchivePlantAtom = atom(
  null,
  async (get, set, plantId: string) => {
    try {
      const updatedPlant = await fileStorage.updatePlant(plantId, { isArchived: false });
      if (updatedPlant) {
        const currentPlants = get(plantsAtom);
        set(plantsAtom, currentPlants.map(plant => 
          plant.id === plantId ? updatedPlant : plant
        ));
      }
      return updatedPlant;
    } catch (error) {
      console.error('Error unarchiving plant:', error);
      throw error;
    }
  }
);

// Атом для обновления стадии растения
export const updatePlantStageAtom = atom(
  null,
  async (get, set, { id, stage, dateField }: { 
    id: string; 
    stage: PlantStage; 
    dateField: keyof Plant; 
  }) => {
    try {
      const updates: Partial<Plant> = { 
        stage,
        [dateField]: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedPlant = await fileStorage.updatePlant(id, updates);
      if (updatedPlant) {
        const currentPlants = get(plantsAtom);
        set(plantsAtom, currentPlants.map(plant => 
          plant.id === id ? updatedPlant : plant
        ));
      }
      return updatedPlant;
    } catch (error) {
      console.error('Error updating plant stage:', error);
      throw error;
    }
  }
);