import * as FileSystem from 'expo-file-system';

const NOTES_FILE = `${FileSystem.documentDirectory}notes.json`;

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  plantId?: string; // привязка к растению, если нужно
}

class NotesService {
  async getNotes(): Promise<Note[]> {
    try {
      const content = await FileSystem.readAsStringAsync(NOTES_FILE);
      return JSON.parse(content) as Note[];
    } catch (error) {
      return [];
    }
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = await this.getNotes();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, newNote];
    await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(updatedNotes));
    
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    const notes = await this.getNotes();
    const index = notes.findIndex(note => note.id === id);
    
    if (index === -1) return null;

    const updatedNote = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    notes[index] = updatedNote;
    await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(notes));
    
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    
    await FileSystem.writeAsStringAsync(NOTES_FILE, JSON.stringify(filteredNotes));
    return true;
  }
}

export const notesService = new NotesService();