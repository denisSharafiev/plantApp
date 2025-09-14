import { Ionicons } from '@expo/vector-icons';
import { addMonths, format, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lunarCalendarService, LunarMonth } from '../services/lunarCalendar';

interface LunarCalendarProps {
  onDayPress?: (date: Date) => void;
}

const { width } = Dimensions.get('window');
const DAY_CELL_SIZE = (width - 64) / 7;

export const LunarCalendar: React.FC<LunarCalendarProps> = ({ onDayPress }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthData, setMonthData] = useState<LunarMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await lunarCalendarService.getMonthData(year, month);
      setMonthData(data);
    } catch (error) {
      console.error('Error loading lunar data:', error);
      setError('Не удалось загрузить данные лунного календаря');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const getDayStyle = (isGoodDay: boolean) => {
    return isGoodDay ? styles.goodDay : styles.badDay;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
        <Text style={styles.loadingText}>Загрузка лунного календаря...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMonthData}>
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок с навигацией */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#32CD32" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy', { locale: ru })}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#32CD32" />
        </TouchableOpacity>
      </View>

      {/* Дни недели */}
      <View style={styles.weekDays}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* Сетка дней */}
      <View style={styles.daysGrid}>
        {monthData?.days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayCell, getDayStyle(day.isGoodDay)]}
            onPress={() => onDayPress?.(day.date)}
          >
            <Text style={styles.dayNumber}>
              {day.date.getDate()}
            </Text>
            <Text style={styles.lunarDay}>
              {day.lunarDayName || day.lunarDay + ' день'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Легенда */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.goodDay]} />
          <Text style={styles.legendText}>Благоприятный день</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.badDay]} />
          <Text style={styles.legendText}>Неблагоприятный день</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    minHeight: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    minHeight: 400,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: DAY_CELL_SIZE,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayCell: {
    width: DAY_CELL_SIZE - 4,
    height: DAY_CELL_SIZE - 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderWidth: 2,
  },
  goodDay: {
    backgroundColor: '#E8F5E8',
    borderColor: '#34C759',
  },
  badDay: {
    backgroundColor: '#FFECEB',
    borderColor: '#FF3B30',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  lunarDay: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#32CD32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});