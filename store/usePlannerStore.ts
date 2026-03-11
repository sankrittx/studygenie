import { create } from 'zustand';
import { db, auth } from '../services/firebaseConfig';
import { collection, doc, setDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';

export type StudyTaskStatus = 'pending' | 'completed' | 'skipped';

export interface StudyTask {
    id: string;
    subjectName: string;
    title: string;
    durationMinutes: number;
    date: string; // ISO string 
    status: StudyTaskStatus;
    isSpacedRepetition?: boolean;
}

interface PlannerState {
    tasks: StudyTask[];
    isSynced: boolean;
    syncTasks: (uid: string) => void;
    clearLocalData: () => void;
    addTask: (task: Omit<StudyTask, 'id' | 'status'>) => Promise<void>;
    updateTaskStatus: (id: string, status: StudyTaskStatus) => Promise<void>;
    getTasksForDate: (dateStr: string) => StudyTask[];
    scheduleSpacedRepetition: (subjectName: string, topic: string) => Promise<void>;
    generateDailyPlan: (subjects: { name: string, credits: number }[]) => Promise<void>;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
    tasks: [],
    isSynced: false,

    clearLocalData: () => set({ tasks: [], isSynced: false }),

    syncTasks: (uid: string) => {
        if (!uid) {
            console.error("No UID provided, cannot sync tasks.");
            return;
        }

        console.log("Attaching Planner snapshot listener for UID:", uid);
        const tasksRef = collection(db, `users/${uid}/tasks`);
        onSnapshot(tasksRef, (snapshot) => {
            console.log(`Planner snapshot received! Docs count: ${snapshot.size}`);
            const fetchedTasks: StudyTask[] = [];
            snapshot.forEach((doc) => {
                fetchedTasks.push({ id: doc.id, ...doc.data() } as StudyTask);
            });
            set({ tasks: [...fetchedTasks], isSynced: true });
        }, (error) => {
            console.error("Firestore Planner Listener Error:", error);
        });
    },

    addTask: async (task) => {
        const user = auth.currentUser;
        if (!user) return;

        const newId = Math.random().toString(36).substring(2, 9);
        const newTask: StudyTask = { ...task, id: newId, status: 'pending' };

        await setDoc(doc(db, `users/${user.uid}/tasks`, newId), newTask);
    },

    updateTaskStatus: async (id, status) => {
        const user = auth.currentUser;
        if (!user) return;

        await updateDoc(doc(db, `users/${user.uid}/tasks`, id), { status });
    },

    getTasksForDate: (dateStr) => {
        const prefix = new Date(dateStr).toISOString().split('T')[0];
        return get().tasks.filter((t) => t.date.startsWith(prefix));
    },

    scheduleSpacedRepetition: async (subjectName, topic) => {
        const user = auth.currentUser;
        if (!user) return;

        const intervals = [1, 3, 7, 15]; // Days
        const now = new Date();
        const batch = writeBatch(db);

        intervals.forEach(days => {
            const repDate = new Date(now);
            repDate.setDate(now.getDate() + days);
            const newId = Math.random().toString(36).substring(2, 9);

            const taskRef = doc(db, `users/${user.uid}/tasks`, newId);
            batch.set(taskRef, {
                id: newId,
                subjectName,
                title: `Revise: ${topic} (Day ${days})`,
                durationMinutes: days === 1 ? 30 : 15, // short quick revision for later days
                date: repDate.toISOString(),
                status: 'pending',
                isSpacedRepetition: true
            });
        });

        await batch.commit();
    },

    generateDailyPlan: async (subjects) => {
        const user = auth.currentUser;
        if (!user || subjects.length === 0) return;

        const todayISO = new Date().toISOString().split('T')[0];
        const existingTasks = get().getTasksForDate(todayISO);
        const existingSubjectNames = new Set(existingTasks.map(t => t.subjectName));
        const missingSubjects = subjects.filter(s => !existingSubjectNames.has(s.name));

        if (missingSubjects.length === 0) return;

        const batch = writeBatch(db);

        missingSubjects.forEach(s => {
            const newId = Math.random().toString(36).substring(2, 9);
            const taskRef = doc(db, `users/${user.uid}/tasks`, newId);

            batch.set(taskRef, {
                id: newId,
                subjectName: s.name,
                title: `General Study: ${s.name}`,
                durationMinutes: 30,
                date: new Date().toISOString(),
                status: 'pending'
            });
        });

        await batch.commit();
    }
}));
