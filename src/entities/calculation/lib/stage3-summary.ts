/**
 * Этап 3: Итоговые расчеты
 * Суммарные показатели по всем блокам
 */

import type { BlockCalculation, SummaryCalculations, InputParams } from '../model/types';

/**
 * Расчет суммарной требуемой мощности
 * Формула из Excel (K40): SUM(D29:L29) - сумма всех мощностей
 *
 * @param blocks - Массив расчетов по блокам
 * @returns Суммарная мощность, кВт
 */
function calculateTotalPowerRequired(blocks: BlockCalculation[]): number {
  const totalPower = blocks
    .filter((block) => !block.isOmitted)
    .reduce((sum, block) => sum + block.power, 0);

  return Number(totalPower.toFixed(2));
}

/**
 * Расчет суммарной доступной мощности
 * Формула из Excel (K41): SUM(D30:L30) - сумма полезных мощностей
 *
 * @param blocks - Массив расчетов по блокам
 * @returns Суммарная полезная мощность, кВт
 */
function calculateTotalPowerAvailable(blocks: BlockCalculation[]): number {
  const totalPower = blocks
    .filter((block) => !block.isOmitted)
    .reduce((sum, block) => sum + block.usefulPower, 0);

  return Number(totalPower.toFixed(2));
}

/**
 * Расчет процента использования мощности
 *
 * @param powerRequired - Требуемая мощность, кВт
 * @param powerAvailable - Доступная мощность, кВт
 * @returns Процент использования
 */
function calculatePowerUtilization(powerRequired: number, powerAvailable: number): number {
  if (powerAvailable === 0) return 0;
  const utilization = (powerRequired / powerAvailable) * 100;
  return Number(utilization.toFixed(2));
}

/**
 * Расчет удлинения проволоки
 * Формула из Excel (E40): L3 / (1 - L3)
 * где L3 - суммарное обжатие в десятичной дроби
 *
 * @param totalReduction - Суммарное обжатие, %
 * @returns Удлинение проволоки
 */
function calculateWireElongation(totalReduction: number): number {
  const reductionDecimal = totalReduction / 100;
  const elongation = reductionDecimal / (1 - reductionDecimal);
  return Number(elongation.toFixed(4));
}

/**
 * Получение конечного предела прочности
 * Берется из последнего активного блока
 *
 * @param blocks - Массив расчетов по блокам
 * @returns Конечный предел прочности {min, max}
 */
function getFinalTensileStrength(blocks: BlockCalculation[]): { min: number; max: number } {
  const activeBlocks = blocks.filter((block) => !block.isOmitted);

  if (activeBlocks.length === 0) {
    return { min: 0, max: 0 };
  }

  const lastBlock = activeBlocks[activeBlocks.length - 1];

  return {
    min: lastBlock.tensileStrength.min,
    max: lastBlock.tensileStrength.max,
  };
}

/**
 * Расчет временного сопротивления разрыву (ВСР ГП)
 * Формула из Excel: (σв - 5) * 9.81
 * Переводит кгс/мм² в Н/мм²
 *
 * @param tensileStrengthKgs - Предел прочности в кгс/мм²
 * @returns ВСР ГП в Н/мм²
 */
function calculateTensileStrengthNewtons(tensileStrengthKgs: number): number {
  const newtons = (tensileStrengthKgs - 5) * 9.81;
  return Number(newtons.toFixed(2));
}

/**
 * Расчет конечного временного сопротивления разрыву
 *
 * @param finalTensileStrength - Конечный предел прочности {min, max} в кгс/мм²
 * @returns ВСР ГП {min, max} в Н/мм²
 */
function calculateFinalTensileStrengthNewtons(finalTensileStrength: {
  min: number;
  max: number;
}): { min: number; max: number } {
  return {
    min: calculateTensileStrengthNewtons(finalTensileStrength.min),
    max: calculateTensileStrengthNewtons(finalTensileStrength.max),
  };
}

/**
 * Выполняет итоговые расчеты (Этап 3)
 *
 * @param blocks - Массив расчетов по блокам
 * @param totalReduction - Суммарное обжатие, %
 * @returns Итоговые расчеты
 */
export function calculateSummaryStage(
  blocks: BlockCalculation[],
  totalReduction: number
): SummaryCalculations {
  // 1. Суммарная требуемая мощность (K40)
  const totalPowerRequired = calculateTotalPowerRequired(blocks);

  // 2. Суммарная доступная мощность (K41)
  const totalPowerAvailable = calculateTotalPowerAvailable(blocks);

  // 3. Использование мощности, %
  const powerUtilization = calculatePowerUtilization(totalPowerRequired, totalPowerAvailable);

  // 4. Удлинение проволоки (E40)
  const wireElongation = calculateWireElongation(totalReduction);

  // 5. Конечный предел прочности
  const finalTensileStrength = getFinalTensileStrength(blocks);

  // 6. ВСР ГП (временное сопротивление разрыву готовой проволоки) в Н/мм²
  const finalTensileStrengthNewtons = calculateFinalTensileStrengthNewtons(finalTensileStrength);

  return {
    totalPowerRequired,
    totalPowerAvailable,
    powerUtilization,
    wireElongation,
    finalTensileStrength,
    finalTensileStrengthNewtons,
  };
}
