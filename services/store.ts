import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  date: number;
}

interface AppState {
  history: HistoryItem[];
  aiFireLevel: number;
  aiExperience: number;
  aiFireType: string;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  addExperience: (amount: number) => void;
  setFireType: (type: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      history: [],
      aiFireLevel: 1,
      aiExperience: 0,
      aiFireType: 'flame',
      addToHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: Math.random().toString(36).substring(7),
            date: Date.now(),
          },
          ...state.history,
        ].slice(0, 50), // Simpan maksimal 50 item
      })),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((i) => i.id !== id),
      })),
      addExperience: (amount) => set((state) => {
        let newXP = state.aiExperience + amount;
        let newLevel = state.aiFireLevel;
        let xpForNextLevel = newLevel * 100;

        while (newXP >= xpForNextLevel) {
          newXP -= xpForNextLevel;
          newLevel += 1;
          xpForNextLevel = newLevel * 100;
        }

        return { aiExperience: newXP, aiFireLevel: newLevel };
      }),
      setFireType: (type) => set({ aiFireType: type }),
    }),
    {
      name: 'antigravity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
