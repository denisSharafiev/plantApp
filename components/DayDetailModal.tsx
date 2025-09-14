import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { lunarCalendarService } from '../services/lunarCalendar';

interface DayDetailModalProps {
  date: Date;
  isVisible: boolean;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ 
  date, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  const dayInfo = lunarCalendarService.getDetailedDayInfo(date);
  const phaseEmoji = {
    newMoon: '🌑',
    waxing: '🌒',
    fullMoon: '🌕',
    waning: '🌖',
    unknown: '🌙'
  }[dayInfo.phase];

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* Заголовок */}
        <Text style={styles.modalTitle}>
          {format(date, 'd MMMM yyyy', { locale: ru })}
        </Text>

        {/* Лунная информация */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Лунная информация</Text>
          <View style={styles.infoRow}>
            <Ionicons name="moon" size={20} color="#5856D6" />
            <Text style={styles.infoText}>
              {phaseEmoji} {dayInfo.phaseName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#5856D6" />
            <Text style={styles.infoText}>
              {dayInfo.lunarDate}, {dayInfo.lunarMonth}
            </Text>
          </View>
          {dayInfo.zodiac && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={20} color="#5856D6" />
              <Text style={styles.infoText}>Знак: {dayInfo.zodiac}</Text>
            </View>
          )}
        </View>

        {/* Рекомендации */}
        <ScrollView style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Садоводческие рекомендации</Text>
          
          {/* Благоприятные activities */}
          {dayInfo.recommendations.suitable.length > 0 && (
            <View style={[styles.recommendationGroup, styles.suitableGroup]}>
              <View style={styles.recommendationHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.recommendationTitle}>Благоприятно:</Text>
              </View>
              {dayInfo.recommendations.suitable.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <Ionicons name="leaf" size={16} color="#34C759" />
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Неблагоприятные activities */}
          {dayInfo.recommendations.unsuitable.length > 0 && (
            <View style={[styles.recommendationGroup, styles.unsuitableGroup]}>
              <View style={styles.recommendationHeader}>
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                <Text style={styles.recommendationTitle}>Неблагоприятно:</Text>
              </View>
              {dayInfo.recommendations.unsuitable.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <Ionicons name="warning" size={16} color="#FF3B30" />
                  <Text style={styles.activityText}>{activity}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Общая оценка дня */}
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {dayInfo.recommendations.suitable.length > dayInfo.recommendations.unsuitable.length 
                ? '✅ Благоприятный день для садоводства'
                : '❌ Неблагоприятный день для садоводства'
              }
            </Text>
          </View>
        </ScrollView>

        {/* Кнопка закрытия */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  recommendationsSection: {
    maxHeight: 300,
    marginBottom: 20,
  },
  recommendationGroup: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  suitableGroup: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  unsuitableGroup: {
    backgroundColor: '#FFECEB',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  summary: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#32CD32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});