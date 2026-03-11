import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'user' | 'assistant';

export interface ChatMessage {
    id: string;
    role: Role;
    text: string;
    timestamp: string;
}

interface ChatState {
    messages: ChatMessage[];
    addMessage: (role: Role, text: string) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            messages: [
                {
                    id: '1',
                    role: 'assistant',
                    text: "Hi! I'm StudyGenie, your AI study assistant. If you have uploaded class notes, I can answer questions about them. How can I help you today?",
                    timestamp: new Date().toISOString()
                }
            ],

            addMessage: (role, text) => set((state) => ({
                messages: [
                    ...state.messages,
                    { id: Math.random().toString(36).substring(2, 9), role, text, timestamp: new Date().toISOString() }
                ]
            })),

            clearChat: () => set({
                messages: [
                    {
                        id: '1',
                        role: 'assistant',
                        text: "Hi! I'm StudyGenie, your AI study assistant. How can I help you today?",
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
