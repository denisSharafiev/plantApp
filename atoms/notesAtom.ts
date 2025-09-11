import { atom } from 'jotai';
import { Note, notesService } from '../services/notesService';

export const notesAtom = atom<Note[]>([]);

export const loadNotesAtom = atom(
  null,
  async (get, set) => {
    try {
      const notes = await notesService.getNotes();
      set(notesAtom, notes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }
);

export const addNoteAtom = atom(
  null,
  async (get, set, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNote = await notesService.createNote(note);
      const currentNotes = get(notesAtom);
      set(notesAtom, [...currentNotes, newNote]);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }
);