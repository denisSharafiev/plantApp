import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Note } from '../services/notesService';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  plants?: { id: string; name: string }[]; // список растений для привязки
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel, plants = [] }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [selectedPlantId, setSelectedPlantId] = useState(note?.plantId || '');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите заголовок заметки');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      plantId: selectedPlantId || undefined,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{note ? 'Редактировать' : 'Новая'} заметка</Text>

      <Text style={styles.label}>Заголовок *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Заголовок заметки"
        maxLength={100}
      />

      <Text style={styles.label}>Содержание</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Текст заметки..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Теги (через запятую)</Text>
      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags}
        placeholder="рассада, полив, удобрения"
      />

      {plants.length > 0 && (
        <>
          <Text style={styles.label}>Привязать к растению</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantsScroll}>
            {plants.map(plant => (
              <TouchableOpacity
                key={plant.id}
                style={[
                  styles.plantButton,
                  selectedPlantId === plant.id && styles.plantButtonSelected
                ]}
                onPress={() => setSelectedPlantId(
                  selectedPlantId === plant.id ? '' : plant.id
                )}
              >
                <Text style={[
                  styles.plantButtonText,
                  selectedPlantId === plant.id && styles.plantButtonTextSelected
                ]}>
                  {plant.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.buttonText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.buttonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  plantsScroll: {
    marginBottom: 16,
  },
  plantButton: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  plantButtonSelected: {
    backgroundColor: '#32CD32',
    borderColor: '#32CD32',
  },
  plantButtonText: {
    color: '#666',
    fontSize: 14,
  },
  plantButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  saveButton: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});