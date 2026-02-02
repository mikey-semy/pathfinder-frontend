/**
 * Zustand store для управления марками стали
 * Хранит пользовательские марки в localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SteelGrade {
  id: string;
  name: string;
  carbonContent: {
    min: number;
    max: number;
  };
  tensileStrength: {
    min: number;
    max: number;
  };
  isCustom?: boolean;
}

// Базовые марки стали (только 85 как пример, остальные добавит пользователь)
const DEFAULT_GRADES: SteelGrade[] = [
  {
    id: '85',
    name: '85',
    carbonContent: { min: 0.75, max: 0.85 },
    tensileStrength: { min: 130, max: 133 },
    isCustom: false,
  },
];

interface SteelGradesStore {
  // Пользовательские марки стали
  customGrades: SteelGrade[];

  // Actions
  addGrade: (grade: Omit<SteelGrade, 'id' | 'isCustom'>) => string;
  updateGrade: (id: string, grade: Partial<Omit<SteelGrade, 'id' | 'isCustom'>>) => void;
  removeGrade: (id: string) => void;

  // Получить все марки (базовые + пользовательские)
  getAllGrades: () => SteelGrade[];

  // Получить марку по ID
  getGradeById: (id: string) => SteelGrade | undefined;
}

export const useSteelGradesStore = create<SteelGradesStore>()(
  persist(
    (set, get) => ({
      customGrades: [],

      addGrade: (grade) => {
        // Генерируем уникальный ID на основе имени и timestamp
        const baseId = grade.name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'grade';
        const id = `${baseId}-${Date.now()}`;
        const newGrade: SteelGrade = {
          ...grade,
          id,
          isCustom: true,
        };

        set((state) => ({
          customGrades: [...state.customGrades, newGrade],
        }));

        return id;
      },

      updateGrade: (id, updates) => {
        set((state) => ({
          customGrades: state.customGrades.map((grade) =>
            grade.id === id ? { ...grade, ...updates } : grade
          ),
        }));
      },

      removeGrade: (id) => {
        set((state) => ({
          customGrades: state.customGrades.filter((grade) => grade.id !== id),
        }));
      },

      getAllGrades: () => {
        const { customGrades } = get();
        return [...DEFAULT_GRADES, ...customGrades];
      },

      getGradeById: (id) => {
        const allGrades = get().getAllGrades();
        return allGrades.find((grade) => grade.id === id);
      },
    }),
    {
      name: 'pathfinder-steel-grades',
    }
  )
);

// Экспорт базовых марок для справки
export const DEFAULT_STEEL_GRADES = DEFAULT_GRADES;
