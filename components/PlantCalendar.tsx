import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlantEvent, plantEventsService } from '../services/plantEventsService';
import { WateringService } from '../services/wateringService';
import { Plant } from '../types/plant';

interface PlantCalendarProps {
  plant: Plant;
  isVisible: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<PlantEvent, 'id' | 'plantId' | 'createdAt'>) => void;
}

export const PlantCalendar: React.FC<PlantCalendarProps> = ({
  plant,
  isVisible,
  onClose,
  onAddEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<PlantEvent[]>([]);
  const [wateringEvents, setWateringEvents] = useState<any[]>([]);

  useEffect(() => {
    if (plant) {
      const calendar = plantEventsService.createPlantCalendar(plant);
      setEvents(calendar.customEvents);
      setWateringEvents(calendar.wateringEvents);
    }
  }, [plant]);

  const getDayEvents = (date: Date) => {
    return [
      ...wateringEvents.filter(event => isSameDay(new Date(event.date), date)),
      ...events.filter(event => isSameDay(new Date(event.date), date)),
    ];
  };

  const renderDay = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const isToday = isSameDay(date, new Date());

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[styles.dayCell, isToday && styles.todayCell]}
        onPress={() => {
          // Здесь можно добавить создание события
        }}
      >
        <Text style={styles.dayNumber}>{format(date, 'd')}</Text>
        {dayEvents.map((event, index) => (
          <View key={index} style={[
            styles.eventDot,
            event.type === 'watering' ? styles.wateringDot : styles.customDot
          ]} />
        ))}
      </TouchableOpacity>
    );
  };

  if (!isVisible) return null;

  // return (
  //   <Modal visible={isVisible} animationType="slide" transparent={true}>
  //     <View style={styles.modalContainer}>
  //       <View style={styles.modalContent}>
  //         <Text style={styles.title}>Календарь: {plant.name}</Text>
          
  //         <ScrollView>
  //           <Text style={styles.subtitle}>График полива: каждые {WateringService.getIntervalDays(plant.wateringSchedule)} дней</Text>
            
  //           {/* Здесь будет сетка календаря */}
  //           <View style={styles.calendarGrid}>
  //             {eachDayOfInterval({
  //               start: startOfMonth(currentDate),
  //               end: endOfMonth(currentDate),
  //             }).map(renderDay)}
  //           </View>

  //           {/* Кнопка добавления события */}
  //           <TouchableOpacity style={styles.addEventButton}>
  //             <Ionicons name="add" size={20} color="white" />
  //             <Text style={styles.addEventText}>Добавить событие</Text>
  //           </TouchableOpacity>
  //         </ScrollView>

  //         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
  //           <Text style={styles.closeButtonText}>Закрыть</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   </Modal>
  // );

    return (
    <View style={styles.calendarContainer}>
      <Text style={styles.subtitle}>График полива: каждые {WateringService.getIntervalDays(plant.wateringSchedule)} дней</Text>
      
      {/* Здесь будет сетка календаря */}
      <View style={styles.calendarGrid}>
        {eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        }).map(renderDay)}
      </View>

      {/* Кнопка добавления события */}
      {/* <TouchableOpacity style={styles.addEventButton}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addEventText}>Добавить событие</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 20,
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  todayCell: {
    backgroundColor: '#007AFF',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 2,
  },
  wateringDot: {
    backgroundColor: '#007AFF',
  },
  customDot: {
    backgroundColor: '#34C759',
  },
  addEventButton: {
    backgroundColor: '#32CD32',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addEventText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6C757D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  calendarContainer: {
    padding: 16,
  },
});