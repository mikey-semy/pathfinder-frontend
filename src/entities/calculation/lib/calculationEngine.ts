/**
 * Главный движок расчетов PathFinder
 * Объединяет все три этапа расчетов
 */

import type { InputParams, CalculationResult } from '../model/types';
import { calculateBasicStage } from './stage1-basic';
import { calculateBlocksStage } from './stage2-blocks';
import { calculateSummaryStage } from './stage3-summary';

/**
 * Выполняет полный расчет маршрута волочения
 * Проходит три этапа:
 * 1. Базовые расчеты (суммарное обжатие, производительность и т.д.)
 * 2. Расчеты по блокам (для каждого из 11 блоков)
 * 3. Итоговые расчеты (суммарная мощность и т.д.)
 *
 * @param params - Входные параметры расчета
 * @returns Полный результат расчета
 */
export function calculateWireDrawingRoute(params: InputParams): CalculationResult {
  // Этап 1: Базовые расчеты
  const basicCalculations = calculateBasicStage(params);

  // Этап 2: Расчеты по блокам
  const blocksCalculations = calculateBlocksStage(basicCalculations, params);

  // Этап 3: Итоговые расчеты
  const summaryCalculations = calculateSummaryStage(
    blocksCalculations,
    basicCalculations.totalReduction
  );

  // Формируем полный результат
  const result: CalculationResult = {
    inputs: params,
    basic: basicCalculations,
    blocks: blocksCalculations,
    summary: summaryCalculations,
    timestamp: new Date(),
  };

  return result;
}

/**
 * Экспортируем функции для отдельного использования этапов
 */
export { calculateBasicStage } from './stage1-basic';
export { calculateBlocksStage } from './stage2-blocks';
export { calculateSummaryStage } from './stage3-summary';
