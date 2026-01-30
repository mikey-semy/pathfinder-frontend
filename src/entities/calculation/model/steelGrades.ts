/**
 * Справочник марок стали для волочения проволоки
 * Содержит типовые характеристики высокоуглеродистых сталей
 */

export interface SteelGrade {
  id: string;
  name: string;
  description: string;
  carbonContent: {
    min: number;
    max: number;
  };
  tensileStrength: {
    min: number;
    max: number;
  };
  // Применение
  applications?: string[];
}

/**
 * Справочник марок стали
 */
export const STEEL_GRADES: SteelGrade[] = [
  {
    id: 'k70',
    name: 'К70 (0.65-0.75% C)',
    description: 'Углеродистая сталь 70',
    carbonContent: { min: 0.65, max: 0.75 },
    tensileStrength: { min: 120, max: 125 },
    applications: ['Общего назначения', 'Пружинная проволока'],
  },
  {
    id: 'k75',
    name: 'К75 (0.70-0.80% C)',
    description: 'Углеродистая сталь 75',
    carbonContent: { min: 0.70, max: 0.80 },
    tensileStrength: { min: 125, max: 128 },
    applications: ['Канаты', 'Пружины'],
  },
  {
    id: 'k80',
    name: 'К80 (0.75-0.85% C)',
    description: 'Углеродистая сталь 80',
    carbonContent: { min: 0.75, max: 0.85 },
    tensileStrength: { min: 128, max: 131 },
    applications: ['Высокопрочная проволока', 'Канаты'],
  },
  {
    id: 'k85',
    name: 'К85 (0.80-0.90% C)',
    description: 'Углеродистая сталь 85',
    carbonContent: { min: 0.75, max: 0.85 },
    tensileStrength: { min: 130, max: 133 },
    applications: ['Высокопрочные канаты', 'Армирование'],
  },
  {
    id: '65g',
    name: '65Г (0.62-0.70% C)',
    description: 'Пружинная сталь 65Г',
    carbonContent: { min: 0.62, max: 0.70 },
    tensileStrength: { min: 118, max: 122 },
    applications: ['Пружины', 'Рессоры'],
  },
  {
    id: '70g',
    name: '70Г (0.67-0.75% C)',
    description: 'Пружинная сталь 70Г',
    carbonContent: { min: 0.67, max: 0.75 },
    tensileStrength: { min: 122, max: 126 },
    applications: ['Пружины', 'Рессоры'],
  },
  {
    id: 'custom',
    name: 'Другая марка стали',
    description: 'Указать параметры вручную',
    carbonContent: { min: 0.0, max: 2.0 },
    tensileStrength: { min: 0, max: 5000 },
    applications: ['Пользовательские параметры'],
  },
];

/**
 * Получить марку стали по ID
 */
export function getSteelGradeById(id: string): SteelGrade | undefined {
  return STEEL_GRADES.find((grade) => grade.id === id);
}

/**
 * Получить список марок стали для селекта
 */
export function getSteelGradeOptions() {
  return STEEL_GRADES.map((grade) => ({
    value: grade.id,
    label: grade.name,
  }));
}
