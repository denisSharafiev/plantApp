declare module 'lunar-calendar' {
  export interface LunarData {
    lunarDay: number;
    lunarDayName: string;
    lunarMonth: number;
    lunarMonthName: string;
    zodiac: string;
    solarTerm: string;
    // Добавляем другие поля которые могут быть в библиотеке
  }

  export function solarToLunar(
    year: number,
    month: number,
    day: number
  ): LunarData;

  export const LunarCalendar: {
    solarToLunar: typeof solarToLunar;
  };

  export default LunarCalendar;
}