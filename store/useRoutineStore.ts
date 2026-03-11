import { create } from 'zustand';
import { db, auth } from '../services/firebaseConfig';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, getDocs } from 'firebase/firestore';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ClassSession {
    id: string;
    day: DayOfWeek;
    subjectName: string;
    startTime: string; // HH:mm format (24h)
    endTime: string;   // HH:mm format (24h)
    roomNumber?: string;

    // Attendance Tracking
    totalClasses: number;
    attendedClasses: number;
    missedClasses: number;
}

interface RoutineState {
    classes: ClassSession[];
    isSynced: boolean;
    syncClasses: (uid: string) => void;
    addClass: (session: Omit<ClassSession, 'id' | 'totalClasses' | 'attendedClasses' | 'missedClasses'>) => Promise<void>;
    removeClass: (id: string) => Promise<void>;
    getClassesForDay: (day: DayOfWeek) => ClassSession[];
    markAttendance: (id: string, status: 'attended' | 'missed') => Promise<void>;
    clearLocalData: () => void;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
    classes: [],
    isSynced: false,

    clearLocalData: () => set({ classes: [], isSynced: false }),

    syncClasses: (uid: string) => {
        if (!uid) {
            console.error("No UID provided, cannot sync classes.");
            return;
        }

        console.log("Attaching Routine snapshot listener for UID:", uid);
        const classesRef = collection(db, `users/${uid}/routines`);

        // Listen to realtime updates in Firestore for this user's routine
        onSnapshot(classesRef, (snapshot) => {
            console.log(`Routine snapshot received! Docs count: ${snapshot.size}`);
            const fetchedClasses: ClassSession[] = [];
            snapshot.forEach((doc) => {
                fetchedClasses.push({ id: doc.id, ...doc.data() } as ClassSession);
            });
            // Force a new array reference to guarantee React re-renders
            set({ classes: [...fetchedClasses], isSynced: true });
            console.log("Zustand store updated with new classes:", fetchedClasses.length);
        }, (error) => {
            console.error("Firestore Routine Listener Error:", error);
        });
    },

    addClass: async (session) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                console.warn("addClass: No authenticated user found.");
                return;
            }

            const newId = Math.random().toString(36).substring(2, 9);
            const newSession: ClassSession = {
                ...session,
                id: newId,
                totalClasses: 0,
                attendedClasses: 0,
                missedClasses: 0
            };

            // Write directly to cloud database
            console.log("Writing to Firestore:", `users/${user.uid}/routines/${newId}`);
            await setDoc(doc(db, `users/${user.uid}/routines`, newId), newSession);
            console.log("Write successful!");
        } catch (error) {
            console.error("Error adding class to Firestore:", error);
        }
    },

    removeClass: async (id) => {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, `users/${user.uid}/routines`, id));
    },

    getClassesForDay: (day) => {
        return get().classes.filter((c) => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    },

    markAttendance: async (id, status) => {
        const user = auth.currentUser;
        const currentClass = get().classes.find(c => c.id === id);
        if (!user || !currentClass) return;

        const updates = {
            totalClasses: currentClass.totalClasses + 1,
            attendedClasses: status === 'attended' ? currentClass.attendedClasses + 1 : currentClass.attendedClasses,
            missedClasses: status === 'missed' ? currentClass.missedClasses + 1 : currentClass.missedClasses
        };

        // Update in cloud, onSnapshot will automatically update local zustand state
        await updateDoc(doc(db, `users/${user.uid}/routines`, id), updates);
    }
}));
