import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Note } from '../services/notesService';

interface NoteDetailProps {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose, onEdit }) => {
  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Просмотр заметки</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="create" size={24} color="#32CD32" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.noteTitle}>{note.title}</Text>
        
        <Text style={styles.date}>
          Создано: {format(new Date(note.createdAt), 'dd MMMM yyyy HH:mm', { locale: ru })}
        </Text>
        <Text style={styles.date}>
          Обновлено: {format(new Date(note.updatedAt), 'dd MMMM yyyy HH:mm', { locale: ru })}
        </Text>

        {note.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Содержание</Text>
            <Text style={styles.noteContent}>{note.content}</Text>
          </View>
        )}

        {note.tags && note.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Теги</Text>
            <View style={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {note.plantId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Привязано к растению</Text>
            <Text style={styles.plantInfo}>ID растения: {note.plantId}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#1976D2',
    fontSize: 14,
  },
  plantInfo: {
    fontSize: 16,
    color: '#666',
  },
});