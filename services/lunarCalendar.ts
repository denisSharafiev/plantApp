import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

const LunarCalendar = require('lunar-calendar');

export interface LunarDay {
  date: Date;
  lunarDay: number;
  lunarDayName: string;
  lunarMonth: string;
  zodiac: string;
  suitableActivities: string[];
  unsuitableActivities: string[];
  isGoodDay: boolean;
  phase: string;
}

export interface LunarMonth {
  month: string;
  year: number;
  days: LunarDay[];
}

class LunarCalendarService {
  private cache: Map<string, LunarMonth> = new Map();

  getDetailedDayInfo(date: Date): {
    phase: string;
    phaseName: string;
    recommendations: { suitable: string[]; unsuitable: string[] };
    zodiac: string;
    lunarDate: string;
    lunarMonth: string;
  } {
    const lunarData = this.getDayData(date);
    const phaseName = this.getPhaseName(lunarData.phase);
    
    return {
      phase: lunarData.phase,
      phaseName,
      recommendations: {
        suitable: lunarData.suitableActivities,
        unsuitable: lunarData.unsuitableActivities
      },
      zodiac: lunarData.zodiac,
      lunarDate: lunarData.lunarDayName,
      lunarMonth: lunarData.lunarMonth
    };
  }

  // Русские названия лунных дней
  private lunarDayNames: { [key: string]: string } = {
    '初一': '1-й день',
    '初二': '2-й день',
    '初三': '3-й день',
    '初四': '4-й день',
    '初五': '5-й день',
    '初六': '6-й день',
    '初七': '7-й день',
    '初八': '8-й день',
    '初九': '9-й день',
    '初十': '10-й день',
    '十一': '11-й день',
    '十二': '12-й день',
    '十三': '13-й день',
    '十四': '14-й день',
    '十五': '15-й день',
    '十六': '16-й день',
    '十七': '17-й день',
    '十八': '18-й день',
    '十九': '19-й день',
    '二十': '20-й день',
    '廿一': '21-й день',
    '廿二': '22-й день',
    '廿三': '23-й день',
    '廿四': '24-й день',
    '廿五': '25-й день',
    '廿六': '26-й день',
    '廿七': '27-й день',
    '廿八': '28-й день',
    '廿九': '29-й день',
    '三十': '30-й день'
  };

  // Русские названия месяцев
  private lunarMonthNames: { [key: string]: string } = {
    '正月': 'Январь',
    '二月': 'Февраль',
    '三月': 'Март',
    '四月': 'Апрель',
    '五月': 'Май',
    '六月': 'Июнь',
    '七月': 'Июль',
    '八月': 'Август',
    '九月': 'Сентябрь',
    '十月': 'Октябрь',
    '冬月': 'Ноябрь',
    '腊月': 'Декабрь'
  };

  // Русские названия знаков зодиака
  private zodiacNames: { [key: string]: string } = {
    '鼠': 'Крыса',
    '牛': 'Бык',
    '虎': 'Тигр',
    '兔': 'Кролик',
    '龙': 'Дракон',
    '蛇': 'Змея',
    '马': 'Лошадь',
    '羊': 'Коза',
    '猴': 'Обезьяна',
    '鸡': 'Петух',
    '狗': 'Собака',
    '猪': 'Свинья'
  };

  private activities = {
    newMoon: {
      suitable: ['Планирование посадок', 'Подготовка почвы', 'Обрезка сухих веток', 'Прополка'],
      unsuitable: ['Посадка растений', 'Пересадка', 'Посев семян', 'Укоренение черенков']
    },
    waxing: {
      suitable: [
        'Посев листовых культур',
        'Посадка растений',
        'Подкормка органическими удобрениями',
        'Полив',
        'Прививка растений'
      ],
      unsuitable: ['Обрезка растений', 'Сбор урожая для хранения', 'Деление корневищ']
    },
    fullMoon: {
      suitable: [
        'Сбор урожая плодов',
        'Подкормка минеральными удобрениями',
        'Борьба с вредителями',
        'Сбор лекарственных трав'
      ],
      unsuitable: ['Посадка растений', 'Пересадка', 'Обрезка', 'Пасынкование']
    },
    waning: {
      suitable: [
        'Посев корнеплодов',
        'Обрезка растений',
        'Сбор корнеплодов',
        'Внесение компоста',
        'Деление многолетников'
      ],
      unsuitable: ['Посадка листовых культур', 'Подкормка', 'Прививка']
    }
  };

  async getMonthData(year: number, month: number): Promise<LunarMonth> {
    const cacheKey = `${year}-${month}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const lunarDays: LunarDay[] = days.map(date => {
      try {
        const lunarData = LunarCalendar.solarToLunar(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        );

        return this.formatLunarDay(date, lunarData);
      } catch (error) {
        console.error('Error getting lunar data:', error);
        return this.getDefaultLunarDay(date);
      }
    });

    const monthData: LunarMonth = {
      month: format(startDate, 'MMMM', { locale: ru }),
      year,
      days: lunarDays
    };

    this.cache.set(cacheKey, monthData);
    return monthData;
  }

  getDayData(date: Date): LunarDay {
    try {
      const lunarData = LunarCalendar.solarToLunar(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );

      return this.formatLunarDay(date, lunarData);
    } catch (error) {
      console.error('Error getting lunar data:', error);
      return this.getDefaultLunarDay(date);
    }
  }

  private formatLunarDay(date: Date, lunarData: any): LunarDay {
    const phase = this.getMoonPhase(lunarData);
    const activities = this.getActivitiesForPhase(phase);

    // Конвертируем китайские названия в русские
    const lunarDayName = this.lunarDayNames[lunarData.lunarDayName] || lunarData.lunarDayName;
    const lunarMonthName = this.lunarMonthNames[lunarData.lunarMonthName] || lunarData.lunarMonthName;
    const zodiac = this.zodiacNames[lunarData.zodiac] || lunarData.zodiac;

    return {
      date,
      lunarDay: lunarData.lunarDay,
      lunarDayName,
      lunarMonth: lunarMonthName,
      zodiac,
      suitableActivities: activities.suitable,
      unsuitableActivities: activities.unsuitable,
      isGoodDay: activities.suitable.length > activities.unsuitable.length,
      phase
    };
  }

  private getDefaultLunarDay(date: Date): LunarDay {
    return {
      date,
      lunarDay: 0,
      lunarDayName: '',
      lunarMonth: '',
      zodiac: '',
      suitableActivities: [],
      unsuitableActivities: [],
      isGoodDay: false,
      phase: 'unknown'
    };
  }

  private getMoonPhase(lunarData: any): string {
    const day = lunarData.lunarDay;
    if (day <= 7) return 'newMoon';
    if (day <= 14) return 'waxing';
    if (day <= 21) return 'fullMoon';
    return 'waning';
  }

  private getActivitiesForPhase(phase: string): { suitable: string[]; unsuitable: string[] } {
    return this.activities[phase as keyof typeof this.activities] || { 
      suitable: [], 
      unsuitable: [] 
    };
  }

  getTodayRecommendations(): { suitable: string[]; unsuitable: string[] } {
    const today = new Date();
    const lunarData = this.getDayData(today);
    
    return {
      suitable: lunarData.suitableActivities,
      unsuitable: lunarData.unsuitableActivities
    };
  }

  getPhaseName(phase: string): string {
    const phases: { [key: string]: string } = {
      newMoon: 'Новолуние',
      waxing: 'Растущая луна',
      fullMoon: 'Полнолуние',
      waning: 'Убывающая луна',
      unknown: 'Неизвестно'
    };
    return phases[phase] || phase;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const lunarCalendarService = new LunarCalendarService();