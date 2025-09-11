import { addDays } from 'date-fns';
import { WateringSchedule } from '../types/plant';

export interface WateringEvent {
  date: Date;
  type: 'auto' | 'manual';
  completed: boolean;
  notes?: string;
}

export class WateringService {
  static calculateNextWateringDates(
    startDate: Date,
    schedule: WateringSchedule,
    count: number = 30
  ): WateringEvent[] {
    const events: WateringEvent[] = [];
    const interval = this.getIntervalDays(schedule);

    for (let i = 0; i < count; i++) {
      const date = addDays(startDate, i * interval);
      events.push({
        date,
        type: 'auto',
        completed: false,
      });
    }

    return events;
  }

  static getIntervalDays(schedule: WateringSchedule): number {
    const intervals = {
      daily: 1,
      '2days': 2,
      '3days': 3,
      '4days': 4,
      '5days': 5,
      '6days': 6,
      '7days': 7,
    };
    return intervals[schedule];
  }

  static getNextWateringDate(events: WateringEvent[]): Date | null {
    const now = new Date();
    const futureEvents = events
      .filter(event => event.date > now && !event.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return futureEvents.length > 0 ? futureEvents[0].date : null;
  }
}