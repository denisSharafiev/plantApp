import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: { title: string; date: Date; type: string; description?: string }) => void;
  plantId: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onSave,
  plantId,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState('watering');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const eventTypes = [
    { value: 'watering', label: 'Полив', icon: 'water' },
    { value: 'feeding', label: 'Подкормка', icon: 'nutrition' },
    { value: 'pruning', label: 'Обрезка', icon: 'cut' },
    { value: 'transplant', label: 'Пересадка', icon: 'swap-horizontal' },
    { value: 'harvest', label: 'Сбор урожая', icon: 'basket' },
    { value: 'custom', label: 'Другое', icon: 'calendar' },
  ];

  const handleSave = () => {
    if (!title.trim()) {
      alert('Введите название события');
      return;
    }

    onSave({
      title: title.trim(),
      date,
      type,
      description: description.trim() || undefined,
    });

    // Сбрасываем форму
    setTitle('');
    setDate(new Date());
    setType('watering');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Добавить событие</Text>

          <Text style={styles.label}>Тип события *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
            {eventTypes.map(eventType => (
              <TouchableOpacity
                key={eventType.value}
                style={[
                  styles.typeButton,
                  type === eventType.value && styles.typeButtonSelected
                ]}
                onPress={() => setType(eventType.value)}
              >
                <Ionicons 
                  name={eventType.icon as any} 
                  size={20} 
                  color={type === eventType.value ? 'white' : '#007AFF'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  type === eventType.value && styles.typeButtonTextSelected
                ]}>
                  {eventType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Название *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Название события"
          />

          <Text style={styles.label}>Дата и время *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.dateText}>
              {date.toLocaleString('ru-RU')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Описание события"
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            isVisible={showDatePicker}
            mode="datetime"
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
          />
        </View>
      </View>
    </Modal>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  typesScroll: {
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  typeButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});