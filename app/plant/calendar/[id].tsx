import { Ionicons } from '@expo/vector-icons';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { plantsAtom } from '../../../atoms/plantsAtom';
import { PlantEvent, plantEventsService } from '../../../services/plantEventsService';

export default function PlantCalendarScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [plants] = useAtom(plantsAtom);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<PlantEvent[]>([]);

  const plant = plants.find(p => p.id === id);

  useEffect(() => {
    if (plant) {
      loadEvents();
    }
  }, [plant, currentDate]);

  const loadEvents = () => {
    if (!plant) return;
    
    const plantEvents = plantEventsService.getPlantEvents(plant.id);
    const monthEvents = plantEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    setEvents(monthEvents);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventColor = (type: string) => {
    const colors = {
      watering: '#007AFF',
      feeding: '#34C759',
      pruning: '#FF9500',
      transplant: '#5856D6',
      harvest: '#FF2D55',
      custom: '#AF52DE',
    };
    return colors[type as keyof typeof colors] || '#8E8E93';
  };

  if (!plant) {
    return (
      <View style={styles.container}>
        <Text>Растение не найдено</Text>
      </View>
    );
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Календарь: {plant.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy', { locale: ru })}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer}>
        <View style={styles.weekDays}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[styles.dayCell, isToday && styles.todayCell]}
              >
                <Text style={styles.dayNumber}>{format(day, 'd')}</Text>
                
                {dayEvents.map((event, index) => (
                  <View
                    key={index}
                    style={[
                      styles.eventDot,
                      { backgroundColor: getEventColor(event.type) }
                    ]}
                  />
                ))}
                
                {dayEvents.length > 0 && (
                  <Text style={styles.eventsCount}>{dayEvents.length}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Легенда:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
            <Text style={styles.legendText}>Полив</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
            <Text style={styles.legendText}>Подкормка</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
            <Text style={styles.legendText}>Обрезка</Text>
          </View>
        </View>
      </View>

      {/* Add Event Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Добавить событие</Text>
      </TouchableOpacity>
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
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  weekDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  eventsCount: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  legend: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});