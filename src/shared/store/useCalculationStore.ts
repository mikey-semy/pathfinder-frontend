/**
 * Zustand store для управления состоянием расчетов
 * Хранит текущий результат и историю расчетов
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationResult } from '@/entities/calculation';

interface CalculationHistoryItem extends CalculationResult {
  id: string;
  name?: string;
}

interface CalculationStore {
  // Текущий результат
  currentResult: CalculationResult | null;

  // История расчетов
  history: CalculationHistoryItem[];

  // Максимальный размер истории
  maxHistorySize: number;

  // Actions
  setCurrentResult: (result: CalculationResult) => void;
  clearCurrentResult: () => void;

  // История
  addToHistory: (result: CalculationResult, name?: string) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  loadFromHistory: (id: string) => void;

  // Утилиты
  exportCurrentResult: () => string;
}

export const useCalculationStore = create<CalculationStore>()(
  persist(
    (set, get) => ({
      currentResult: null,
      history: [],
      maxHistorySize: 10,

      setCurrentResult: (result) => {
        set({ currentResult: result });

        // Автоматически добавляем в историю
        get().addToHistory(result);
      },

      clearCurrentResult: () => {
        set({ currentResult: null });
      },

      addToHistory: (result, name) => {
        const id = `calc-${Date.now()}`;
        const historyItem: CalculationHistoryItem = {
          ...result,
          id,
          name: name || `Расчет ${new Date(result.timestamp).toLocaleString('ru-RU')}`,
        };

        set((state) => {
          const newHistory = [historyItem, ...state.history];

          // Ограничиваем размер истории
          if (newHistory.length > state.maxHistorySize) {
            newHistory.pop();
          }

          return { history: newHistory };
        });
      },

      removeFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      loadFromHistory: (id) => {
        const item = get().history.find((item) => item.id === id);
        if (item) {
          set({ currentResult: item });
        }
      },

      exportCurrentResult: () => {
        const result = get().currentResult;
        if (!result) {
          return '';
        }

        return JSON.stringify(result, null, 2);
      },
    }),
    {
      name: 'pathfinder-calculation-storage',
      // Не сохраняем текущий результат, только историю
      partialize: (state) => ({
        history: state.history,
        maxHistorySize: state.maxHistorySize,
      }),
      skipHydration: true,
    }
  )
);
