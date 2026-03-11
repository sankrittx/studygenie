import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NoteType = 'image' | 'pdf' | 'text';

export interface StudyNote {
    id: string;
    subjectName: string;
    lectureTitle: string;
    date: string; // ISO string 
    type: NoteType;
    uri?: string;     // For local image/pdf paths
    content?: string; // For text notes
    extractedTopics?: string[]; // AI generated
}

interface NotesState {
    notes: StudyNote[];
    addNote: (note: Omit<StudyNote, 'id'>) => void;
    removeNote: (id: string) => void;
    getSubjects: () => string[];
    getNotesBySubject: (subject: string) => StudyNote[];
}

export const useNotesStore = create<NotesState>()(
    persist(
        (set, get) => ({
            notes: [],

            addNote: (note) => set((state) => ({
                notes: [...state.notes, { ...note, id: Math.random().toString(36).substring(2, 9) }],
            })),

            removeNote: (id) => set((state) => ({
                notes: state.notes.filter((n) => n.id !== id),
            })),

            getSubjects: () => {
                const uniqueSubjects = new Set(get().notes.map((n) => n.subjectName));
                return Array.from(uniqueSubjects);
            },

            getNotesBySubject: (subject) => {
                return get().notes.filter((n) => n.subjectName === subject).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            },
        }),
        {
            name: 'notes-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
