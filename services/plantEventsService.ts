import { Plant, WateringSchedule } from '../types/plant';
import { WateringEvent, WateringService } from './wateringService';

export interface PlantEvent {
  id: string;
  plantId: string;
  date: string;
  type: 'watering' | 'feeding' | 'pruning' | 'transplant' | 'harvest' | 'custom';
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export interface PlantCalendar {
  plant: Plant;
  wateringEvents: WateringEvent[];
  customEvents: PlantEvent[];
}

class PlantEventsService {
  private events: PlantEvent[] = [];

  // Создание календаря для растения
  createPlantCalendar(plant: Plant): PlantCalendar {
    const wateringEvents = WateringService.calculateNextWateringDates(
      new Date(plant.plantingDate),
      plant.wateringSchedule,
      90 // на 3 месяца вперед
    );

    return {
      plant,
      wateringEvents,
      customEvents: this.getPlantEvents(plant.id),
    };
  }

  // Добавление custom события
  addCustomEvent(plantId: string, event: Omit<PlantEvent, 'id' | 'plantId' | 'createdAt'>): PlantEvent {
    const newEvent: PlantEvent = {
      ...event,
      id: Date.now().toString(),
      plantId,
      createdAt: new Date().toISOString(),
    };

    this.events.push(newEvent);
    return newEvent;
  }

  // Получение событий растения
  getPlantEvents(plantId: string): PlantEvent[] {
    return this.events.filter(event => event.plantId === plantId);
  }

  // Отметка события как выполненного
  markEventCompleted(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.completed = true;
    }
  }

  // Получение ближайшего события
  getNextEvent(plantId: string): PlantEvent | WateringEvent | null {
    const plantEvents = this.getPlantEvents(plantId);
    const now = new Date();

    const allEvents = [
      ...plantEvents,
      ...this.createPlantCalendar({ id: plantId } as Plant).wateringEvents.map(e => ({
        ...e,
        type: 'watering',
        title: 'Полив',
      }))
    ];

    const futureEvents = allEvents
      .filter(event => new Date(event.date) > now && !event.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureEvents[0] || null;
  }

  // Обновление графика полива
  updateWateringSchedule(plantId: string, newSchedule: WateringSchedule): void {
    // Здесь будет логика обновления событий полива
    // В реальном приложении это бы сохранялось в базу данных
  }
}

export const plantEventsService = new PlantEventsService();