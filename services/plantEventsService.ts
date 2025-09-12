import * as FileSystem from 'expo-file-system';
import { Plant, WateringSchedule } from '../types/plant';
import { NotificationService } from './notificationService';
import { WateringEvent, WateringService } from './wateringService';

const EVENTS_FILE = `${FileSystem.documentDirectory}plant_events.json`;

export interface PlantEvent {
  id: string;
  plantId: string;
  date: string;
  type: 'watering' | 'feeding' | 'pruning' | 'transplant' | 'harvest' | 'custom';
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  reminderMinutes?: number; // За сколько минут напоминать
  notificationId?: string; // ID уведомления в системе
}

export interface PlantCalendar {
  plant: Plant;
  wateringEvents: WateringEvent[];
  customEvents: PlantEvent[];
}

class PlantEventsService {
  private events: PlantEvent[] = [];

  // Инициализация - загрузка событий из файла
  async initialize(): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(EVENTS_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(EVENTS_FILE);
        this.events = JSON.parse(content);
      } else {
        this.events = [];
        await this.saveEvents();
      }
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    }
  }

  // Сохранение событий в файл
  private async saveEvents(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(EVENTS_FILE, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  }

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

  // В метод addCustomEvent добавляем создание напоминания:
  async addCustomEvent(plantId: string, event: Omit<PlantEvent, 'id' | 'plantId' | 'createdAt' | 'updatedAt' | 'notificationId'>): Promise<PlantEvent> {
    const newEvent: PlantEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      plantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Создаем напоминание, если указано
    if (event.reminderMinutes !== undefined && event.reminderMinutes > 0) {
      try {
        const notificationId = await NotificationService.scheduleEventNotification(
          newEvent,
          event.reminderMinutes
        );
        if (notificationId) {
          newEvent.notificationId = notificationId;
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }

    this.events.push(newEvent);
    await this.saveEvents();
    return newEvent;
  }

  // Добавляем метод для обновления напоминаний
  async updateEventReminder(eventId: string, reminderMinutes?: number): Promise<PlantEvent | null> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return null;

    const event = this.events[eventIndex];

    // Отменяем старое уведомление
    if (event.notificationId) {
      await NotificationService.cancelNotification(event.notificationId);
    }

    // Создаем новое уведомление, если нужно
    let notificationId: string | undefined;
    if (reminderMinutes !== undefined && reminderMinutes > 0) {
      try {
        const newNotificationId = await NotificationService.scheduleEventNotification(
          { ...event, reminderMinutes },
          reminderMinutes
        );
        if (newNotificationId) {
          notificationId = newNotificationId;
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }

    const updatedEvent = {
      ...event,
      reminderMinutes,
      notificationId,
      updatedAt: new Date().toISOString(),
    };

    this.events[eventIndex] = updatedEvent;
    await this.saveEvents();
    
    return updatedEvent;
  }

  // Добавляем отмену напоминаний при удалении события
  async deletePlantEvents(plantId: string): Promise<void> {
    // Отменяем все уведомления для событий растения
    const plantEvents = this.events.filter(event => event.plantId === plantId);
    for (const event of plantEvents) {
      if (event.notificationId) {
        await NotificationService.cancelNotification(event.notificationId);
      }
    }

    this.events = this.events.filter(event => event.plantId !== plantId);
    await this.saveEvents();
  }

  // Получение событий растения
  getPlantEvents(plantId: string): PlantEvent[] {
    return this.events.filter(event => event.plantId === plantId);
  }

  // Отметка события как выполненного
  async markEventCompleted(eventId: string): Promise<void> {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.completed = true;
      event.updatedAt = new Date().toISOString();
      await this.saveEvents();
    }
  }

  // Получение ближайшего события
  getNextEvent(plantId: string): PlantEvent | null {
    const plantEvents = this.getPlantEvents(plantId);
    const now = new Date();

    const futureEvents = plantEvents
      .filter(event => new Date(event.date) > now && !event.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureEvents[0] || null;
  }

  // Обновление графика полива растения
  async updateWateringSchedule(plantId: string, newSchedule: WateringSchedule, plantingDate: string): Promise<void> {
    // Удаляем старые события полива для этого растения
    this.events = this.events.filter(event => 
      !(event.plantId === plantId && event.type === 'watering')
    );

    // Создаем новые события полива по новому графику
    const newWateringEvents = WateringService.calculateNextWateringDates(
      new Date(plantingDate),
      newSchedule,
      90
    );

    // Преобразуем WateringEvent в PlantEvent
    const plantEvents: PlantEvent[] = newWateringEvents.map((wateringEvent, index) => ({
      id: `watering_${plantId}_${Date.now()}_${index}`,
      plantId,
      date: wateringEvent.date.toISOString(),
      type: 'watering' as const,
      title: 'Полив',
      description: `Автоматическое событие полива по графику`,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Добавляем новые события
    this.events = [...this.events, ...plantEvents];
    await this.saveEvents();
  }

  // Создание событий полива при добавлении растения
  async createWateringEventsForNewPlant(plant: Plant): Promise<void> {
    const wateringEvents = WateringService.calculateNextWateringDates(
      new Date(plant.plantingDate),
      plant.wateringSchedule,
      90
    );

    const plantEvents: PlantEvent[] = wateringEvents.map((event, index) => ({
      id: `watering_${plant.id}_${Date.now()}_${index}`,
      plantId: plant.id,
      date: event.date.toISOString(),
      type: 'watering',
      title: 'Полив',
      description: `Автоматическое событие полива`,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.events = [...this.events, ...plantEvents];
    await this.saveEvents();
  }

  // Получение всех событий для календаря
  getCalendarEvents(plantId: string): (PlantEvent | WateringEvent)[] {
    const plantEvents = this.getPlantEvents(plantId);
    const now = new Date();
    
    // Для демонстрации добавляем ближайшие события полива
    const wateringEvents = WateringService.calculateNextWateringDates(
      now,
      '7days', // будет заменено реальным графиком из растения
      30
    );

    return [
      ...plantEvents,
      ...wateringEvents.map(event => ({
        ...event,
        // Добавляем недостающие поля для совместимости
        id: `temp_watering_${Date.now()}`,
        plantId,
        title: 'Полив',
        description: 'Автоматическое событие полива',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    ];
  }

  // Удаление всех событий растения
  // async deletePlantEvents(plantId: string): Promise<void> {
  //   this.events = this.events.filter(event => event.plantId !== plantId);
  //   await this.saveEvents();
  // }

  // Обновление события
  async updateEvent(eventId: string, updates: Partial<PlantEvent>): Promise<PlantEvent | null> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return null;

    const updatedEvent = {
      ...this.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.events[eventIndex] = updatedEvent;
    await this.saveEvents();
    
    return updatedEvent;
  }

  // Получение события по ID
  getEventById(eventId: string): PlantEvent | null {
    return this.events.find(event => event.id === eventId) || null;
  }

  // Очистка всех событий (для тестирования)
  async clearAllEvents(): Promise<void> {
    this.events = [];
    await this.saveEvents();
  }
}

export const plantEventsService = new PlantEventsService();

// Инициализация при запуске приложения
plantEventsService.initialize().catch(console.error);