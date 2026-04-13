import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  date: number;
  progress: number;
  status: 'none' | 'downloading' | 'done' | 'failed';
}

interface AppState {
  history: HistoryItem[];
  aiFireLevel: number;
  aiExperience: number;
  userName: string;
  isDarkMode: boolean;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'date' | 'progress' | 'status'>) => string;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  updateHistoryProgress: (id: string, progress: number) => void;
  updateHistoryStatus: (id: string, status: HistoryItem['status']) => void;
  addExperience: (amount: number) => void;
  updateUserName: (name: string) => void;
  toggleDarkMode: () => void;
  isAlreadyDownloaded: (url: string) => boolean;
  turboDownload: boolean;
  toggleTurboDownload: () => void;
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      history: [],
      aiFireLevel: 1,
      aiExperience: 0,
      userName: 'X AR',
      isDarkMode: true,
      turboDownload: true,
      avatarUri: null,
      addToHistory: (item) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => {
          // Check if URL already exists, if so, remove old one and put new one at top
          const filtered = state.history.filter(i => i.url !== item.url);
          return {
            history: [
              {
                ...item,
                id,
                date: Date.now(),
                progress: 0,
                status: 'none' as HistoryItem['status'],
              },
              ...filtered,
            ].slice(0, 50),
          };
        });
        return id;
      },
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((i) => i.id !== id),
      })),
      updateHistoryProgress: (id, progress) => set((state) => ({
        history: state.history.map((h) => h.id === id ? { ...h, progress } : h)
      })),
      updateHistoryStatus: (id, status) => set((state) => ({
        history: state.history.map((h) => h.id === id ? { ...h, status } : h)
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
      updateUserName: (name) => set({ userName: name }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      isAlreadyDownloaded: (url) => {
        return get().history.some((item) => item.url === url && item.status === 'done');
      },
      toggleTurboDownload: () => set((state) => ({ turboDownload: !state.turboDownload })),
      setAvatarUri: (uri) => set({ avatarUri: uri }),
    }),
    {
      name: 'antigravity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
