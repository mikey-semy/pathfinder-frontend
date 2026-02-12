/**
 * Zod схема валидации для формы расчета PathFinder
 * Соответствует типу InputParams из calculation engine
 */

import { z } from 'zod';
import { VALIDATION_RANGES } from '@/entities/calculation/model/constants';

/**
 * Схема для формы расчета волочения проволоки
 */
export const pathfinderFormSchema = z
  .object({
    // Тип заготовки
    rodType: z
      .string({ message: 'Выберите тип заготовки' })
      .min(1, 'Тип заготовки обязателен'),

    // Диаметр заготовки
    initialWireSize: z
      .number({ message: 'Укажите диаметр заготовки' })
      .min(
        VALIDATION_RANGES.initialWireSize.min,
        `Минимальный диаметр ${VALIDATION_RANGES.initialWireSize.min} мм`
      )
      .max(
        VALIDATION_RANGES.initialWireSize.max,
        `Максимальный диаметр ${VALIDATION_RANGES.initialWireSize.max} мм`
      ),

    // Диаметр готовой проволоки
    finalWireSize: z
      .number({ message: 'Укажите диаметр готовой проволоки' })
      .min(
        VALIDATION_RANGES.finalWireSize.min,
        `Минимальный диаметр ${VALIDATION_RANGES.finalWireSize.min} мм`
      )
      .max(
        VALIDATION_RANGES.finalWireSize.max,
        `Максимальный диаметр ${VALIDATION_RANGES.finalWireSize.max} мм`
      ),

    // Содержание углерода
    carbonContentMin: z
      .number()
      .min(VALIDATION_RANGES.carbonContent.min, 'Минимум 0%')
      .max(VALIDATION_RANGES.carbonContent.max, 'Максимум 2%'),

    carbonContentMax: z
      .number()
      .min(VALIDATION_RANGES.carbonContent.min, 'Минимум 0%')
      .max(VALIDATION_RANGES.carbonContent.max, 'Максимум 2%'),

    // Предел прочности патентованной заготовки (в Н/мм²)
    patentedTensileStrengthMin: z
      .number()
      .min(VALIDATION_RANGES.tensileStrength.min, 'Минимум 0 Н/мм²')
      .max(VALIDATION_RANGES.tensileStrength.max, 'Максимум 5000 Н/мм²'),

    patentedTensileStrengthMax: z
      .number()
      .min(VALIDATION_RANGES.tensileStrength.min, 'Минимум 0 Н/мм²')
      .max(VALIDATION_RANGES.tensileStrength.max, 'Максимум 5000 Н/мм²'),

    // Количество переходов
    totalTransitions: z
      .number()
      .int('Должно быть целым числом')
      .min(VALIDATION_RANGES.totalTransitions.min, 'Минимум 1 переход')
      .max(VALIDATION_RANGES.totalTransitions.max, 'Максимум 19 переходов'),

    // Скорость волочения
    drawingVelocity: z
      .number()
      .min(
        VALIDATION_RANGES.drawingVelocity.min,
        `Минимум ${VALIDATION_RANGES.drawingVelocity.min} м/с`
      )
      .max(
        VALIDATION_RANGES.drawingVelocity.max,
        `Максимум ${VALIDATION_RANGES.drawingVelocity.max} м/с`
      ),

    // Начать с блока №
    startBlock: z
      .number()
      .int('Должно быть целым числом')
      .min(VALIDATION_RANGES.startBlock.min, 'Минимум блок 1')
      .max(VALIDATION_RANGES.startBlock.max, 'Максимум блок 10'),
  })
  // Перекрестная валидация
  .refine((data) => data.finalWireSize < data.initialWireSize, {
    message: 'Диаметр готовой проволоки должен быть меньше диаметра заготовки',
    path: ['finalWireSize'],
  })
  .refine((data) => data.carbonContentMax >= data.carbonContentMin, {
    message: 'Максимум должен быть >= минимума',
    path: ['carbonContentMax'],
  })
  .refine(
    (data) => data.patentedTensileStrengthMax >= data.patentedTensileStrengthMin,
    {
      message: 'Максимум должен быть >= минимума',
      path: ['patentedTensileStrengthMax'],
    }
  );

/**
 * Тип данных формы (автоматически выводится из схемы)
 */
export type PathfinderFormData = z.infer<typeof pathfinderFormSchema>;

/**
 * Значения по умолчанию для формы
 * σв указан в Н/мм² (130 кгс/мм² * 9.81 ≈ 1275 Н/мм²)
 */
export const defaultFormValues: PathfinderFormData = {
  rodType: '85',
  initialWireSize: 4.0,
  finalWireSize: 1.3,
  carbonContentMin: 0.75,
  carbonContentMax: 0.85,
  patentedTensileStrengthMin: 1275,
  patentedTensileStrengthMax: 1305,
  totalTransitions: 9,
  drawingVelocity: 9.0,
  startBlock: 1,
};
