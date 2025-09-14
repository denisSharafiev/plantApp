import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { plantsAtom } from '../../atoms/plantsAtom';
import { NoteDetail } from '../../components/NoteDetail';
import { NoteEditor } from '../../components/NoteEditor';
import { NotesList } from '../../components/NotesList';
import { Note, notesService } from '../../services/notesService';

export default function NotesScreen() {
  const [plants] = useAtom(plantsAtom);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditorVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorVisible(true);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsDetailVisible(true);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedNote) {
        await notesService.updateNote(selectedNote.id, noteData);
      } else {
        await notesService.createNote(noteData);
      }
      setIsEditorVisible(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const plantsForSelection = plants.map(plant => ({
    id: plant.id,
    name: plant.name
  }));

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Заметки</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateNote}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Список заметок */}
      <NotesList
        onEditNote={handleEditNote}
        onViewNote={handleViewNote}
        refreshTrigger={refreshTrigger}
      />

      {/* Модальное окно редактора */}
      <Modal
        visible={isEditorVisible}
        animationType="slide"
        onRequestClose={() => setIsEditorVisible(false)}
      >
        <NoteEditor
          note={selectedNote || undefined}
          onSave={handleSaveNote}
          onCancel={() => setIsEditorVisible(false)}
          plants={plantsForSelection}
        />
      </Modal>

      {/* Модальное окно просмотра */}
      <Modal
        visible={isDetailVisible}
        animationType="slide"
        onRequestClose={() => setIsDetailVisible(false)}
      >
        {selectedNote && (
          <NoteDetail
            note={selectedNote}
            onClose={() => setIsDetailVisible(false)}
            onEdit={() => {
              setIsDetailVisible(false);
              handleEditNote(selectedNote);
            }}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#32CD32',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});