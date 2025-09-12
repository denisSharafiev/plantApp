import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: { 
    title: string; 
    date: Date; 
    type: string; 
    description?: string;
    reminderMinutes?: number;
  }) => void;
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
  const [reminderMinutes, setReminderMinutes] = useState<ValueType | null>(60);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);

  const eventTypes = [
    { value: 'watering', label: 'Полив', icon: 'water' },
    { value: 'feeding', label: 'Подкормка', icon: 'nutrition' },
    { value: 'pruning', label: 'Обрезка', icon: 'cut' },
    { value: 'transplant', label: 'Пересадка', icon: 'swap-horizontal' },
    { value: 'harvest', label: 'Сбор урожая', icon: 'basket' },
    { value: 'custom', label: 'Другое', icon: 'calendar' },
  ];

  const reminderOptions = [
    { label: 'Не напоминать', value: 0 },
    { label: 'За 5 минут', value: 5 },
    { label: 'За 15 минут', value: 15 },
    { label: 'За 30 минут', value: 30 },
    { label: 'За 1 час', value: 60 },
    { label: 'За 2 часа', value: 120 },
    { label: 'За 1 день', value: 1440 },
    { label: 'За 2 дня', value: 2880 },
  ];

  const handleSave = () => {
    if (!title.trim()) {
      alert('Введите название события');
      return;
    }

    // Преобразуем ValueType в number | undefined
    const reminderValue = reminderMinutes === 0 ? undefined : Number(reminderMinutes);

    onSave({
      title: title.trim(),
      date,
      type,
      description: description.trim() || undefined,
      reminderMinutes: reminderValue === 0 ? undefined : reminderValue,
    });

    // Сбрасываем форму
    setTitle('');
    setDate(new Date());
    setType('watering');
    setDescription('');
    setReminderMinutes(60);
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setTitle('');
    setDate(new Date());
    setType('watering');
    setDescription('');
    setReminderMinutes(60);
    setIsReminderDropdownOpen(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Добавить событие</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Дата и время *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <Text style={styles.dateText}>
                {date.toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Напоминание</Text>
            <DropDownPicker
              open={isReminderDropdownOpen}
              value={reminderMinutes}
              items={reminderOptions}
              setOpen={setIsReminderDropdownOpen}
              setValue={setReminderMinutes}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Выберите время напоминания"
              zIndex={3000}
              zIndexInverse={1000}
            />

            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Описание события"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.buttons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                <Text style={styles.buttonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.buttonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="datetime"
            onConfirm={(selectedDate) => {
              setDate(selectedDate);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
            locale="ru_RU"
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
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  typesScroll: {
    marginBottom: 16,
    maxHeight: 60,
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
    minWidth: 100,
  },
  typeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
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
    color: '#333',
  },
  textArea: {
    minHeight: 100,
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
    marginBottom: 10,
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
  dropdown: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    borderRadius: 8,
    marginBottom: 16,
    zIndex: 3000,
  },
  dropdownContainer: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    zIndex: 3000,
  },
});