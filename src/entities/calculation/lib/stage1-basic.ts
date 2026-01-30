/**
 * Этап 1: Базовые расчеты
 * Расчеты суммарного обжатия, среднего обжатия, производительности и т.д.
 */

import type { InputParams, BasicCalculations } from '../model/types';
import {
  PHYSICAL_CONSTANTS,
  PRODUCTION_PARAMETERS,
} from '../model/constants';

/**
 * Расчет суммарного обжатия
 * Формула из Excel (L3): 1 - (FINSIZE/INSIZE)^2
 *
 * @param finalSize - Конечный диаметр проволоки, мм
 * @param initialSize - Начальный диаметр заготовки, мм
 * @returns Суммарное обжатие, %
 */
export function calculateTotalReduction(
  finalSize: number,
  initialSize: number
): number {
  const reduction = 1 - Math.pow(finalSize / initialSize, 2);
  return Number((reduction * 100).toFixed(2));
}

/**
 * Расчет среднего единичного обжатия
 * Формула из Excel (L4): 1 - ((FINSIZE/INSIZE)^2)^(1/NoDIES)
 *
 * @param finalSize - Конечный диаметр проволоки, мм
 * @param initialSize - Начальный диаметр заготовки, мм
 * @param totalTransitions - Количество переходов
 * @returns Среднее единичное обжатие, %
 */
export function calculateAverageReduction(
  finalSize: number,
  initialSize: number,
  totalTransitions: number
): number {
  const exponent = 1 / totalTransitions;
  const reduction = 1 - Math.pow(Math.pow(finalSize / initialSize, 2), exponent);
  return Number((reduction * 100).toFixed(2));
}

/**
 * Расчет коэффициента распределения относительного обжатия по переходам
 * Формула из Excel (E11): (AVREDN*100 - L5*100) / ((NoDIES-1)/2)
 *
 * @param averageReduction - Среднее обжатие, %
 * @param lastDieReduction - Обжатие в последней волоке, %
 * @param totalTransitions - Количество переходов
 * @returns Коэффициент распределения
 */
export function calculateDistributionCoefficient(
  averageReduction: number,
  lastDieReduction: number,
  totalTransitions: number
): number {
  const numerator = averageReduction - lastDieReduction;
  const denominator = (totalTransitions - 1) / 2;
  return Number((numerator / denominator).toFixed(4));
}

/**
 * Расчет входной скорости
 * Формула из Excel (L8): FINSIZE^2 * FINSPD / INSIZE^2
 *
 * @param finalSize - Конечный диаметр проволоки, мм
 * @param initialSize - Начальный диаметр заготовки, мм
 * @param drawingVelocity - Скорость волочения, м/с
 * @returns Входная скорость, м/с
 */
export function calculateInputSpeed(
  finalSize: number,
  initialSize: number,
  drawingVelocity: number
): number {
  const speed = (Math.pow(finalSize, 2) * drawingVelocity) / Math.pow(initialSize, 2);
  return Number(speed.toFixed(3));
}

/**
 * Расчет производительности в кг/час
 * Формула из Excel (K10): (FINSIZE)^2 * 22.2112 * FINSPD
 *
 * @param finalSize - Конечный диаметр проволоки, мм
 * @param drawingVelocity - Скорость волочения, м/с
 * @returns Производительность, кг/час
 */
export function calculateKgPerHour(
  finalSize: number,
  drawingVelocity: number
): number {
  const kgPerHour = Math.pow(finalSize, 2) * PHYSICAL_CONSTANTS.DENSITY_FACTOR * drawingVelocity;
  return Number(kgPerHour.toFixed(2));
}

/**
 * Расчет производительности в тоннах за 8 часов
 * Формула из Excel (K11): K10 * 12 * 0.75 / 1000
 *
 * @param kgPerHour - Производительность в кг/час
 * @returns Производительность, тонн/8ч (при 75% загрузке)
 */
export function calculateTonnesPer8Hours(kgPerHour: number): number {
  const tonnes =
    (kgPerHour * PRODUCTION_PARAMETERS.HOURS_PER_SHIFT * PRODUCTION_PARAMETERS.UTILIZATION_FACTOR) /
    PRODUCTION_PARAMETERS.KG_TO_TONNES;
  return Number(tonnes.toFixed(2));
}

/**
 * Расчет номера блока со средним обжатием
 * Формула из Excel (L2): (NoDIES)/2 - 0.5 + STRTBLK
 *
 * @param totalTransitions - Количество переходов
 * @param startBlock - Начальный блок
 * @returns Номер блока со средним обжатием
 */
export function calculateAverageBlockNumber(
  totalTransitions: number,
  startBlock: number
): number {
  const blockNumber = totalTransitions / 2 - 0.5 + startBlock;
  return Number(blockNumber.toFixed(1));
}

/**
 * Выполняет все базовые расчеты (Этап 1)
 *
 * @param params - Входные параметры
 * @returns Результаты базовых расчетов
 */
export function calculateBasicStage(params: InputParams): BasicCalculations {
  const {
    initialWireSize,
    finalWireSize,
    totalTransitions,
    drawingVelocity,
    lastDieReduction,
    startBlock,
  } = params;

  // 1. Суммарное обжатие (L3)
  const totalReduction = calculateTotalReduction(finalWireSize, initialWireSize);

  // 2. Среднее единичное обжатие (L4)
  const averageReduction = calculateAverageReduction(
    finalWireSize,
    initialWireSize,
    totalTransitions
  );

  // 3. Коэффициент распределения (E11)
  const distributionCoefficient = calculateDistributionCoefficient(
    averageReduction,
    lastDieReduction,
    totalTransitions
  );

  // 4. Входная скорость (L8)
  const inputSpeed = calculateInputSpeed(finalWireSize, initialWireSize, drawingVelocity);

  // 5. Производительность кг/час (K10)
  const kgPerHour = calculateKgPerHour(finalWireSize, drawingVelocity);

  // 6. Производительность тонн/8ч (K11)
  const tonnesPer8Hours = calculateTonnesPer8Hours(kgPerHour);

  // 7. Номер блока со средним обжатием (L2)
  const averageBlockNumber = calculateAverageBlockNumber(totalTransitions, startBlock);

  return {
    totalReduction,
    averageReduction,
    distributionCoefficient,
    inputSpeed,
    kgPerHour,
    tonnesPer8Hours,
    averageBlockNumber,
  };
}
