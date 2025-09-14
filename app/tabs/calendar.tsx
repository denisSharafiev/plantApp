import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DayDetailModal } from '../../components/DayDetailModal';
import { LunarCalendar } from '../../components/LunarCalendar';
import { lunarCalendarService } from '../../services/lunarCalendar';

const { height } = Dimensions.get('window');

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedDate(null);
  };

  const getTodayRecommendations = () => {
    return lunarCalendarService.getTodayRecommendations();
  };

  const todayRecommendations = getTodayRecommendations();

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Лунный календарь садовода</Text>
      </View>

      {/* Основной контент с ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Рекомендации на сегодня */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Рекомендации на сегодня</Text>
          <Text style={styles.todayDate}>
            {format(new Date(), 'd MMMM yyyy', { locale: ru })}
          </Text>

          <View style={styles.recommendations}>
            {todayRecommendations.suitable.length > 0 && (
              <View style={styles.recommendationGroup}>
                <Text style={styles.recommendationTitle}>✅ Благоприятно:</Text>
                {todayRecommendations.suitable.map((activity, index) => (
                  <Text key={index} style={styles.recommendationText}>• {activity}</Text>
                ))}
              </View>
            )}

            {todayRecommendations.unsuitable.length > 0 && (
              <View style={styles.recommendationGroup}>
                <Text style={styles.recommendationTitle}>❌ Неблагоприятно:</Text>
                {todayRecommendations.unsuitable.map((activity, index) => (
                  <Text key={index} style={styles.recommendationText}>• {activity}</Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Календарь */}
        <View style={styles.calendarContainer}>
          <LunarCalendar onDayPress={handleDayPress} />
        </View>
      </ScrollView>

      {/* Модальное окно с деталями дня */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        {selectedDate && (
          <DayDetailModal 
            date={selectedDate}
            isVisible={isModalVisible}
            onClose={closeModal}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  todaySection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  todayDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
  },
  recommendations: {
    gap: 16,
  },
  recommendationGroup: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#32CD32',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
  calendarContainer: {
    flex: 1,
    minHeight: 500,
  },
});