/**
 * Этап 2: Расчеты по блокам
 * Для каждого блока рассчитываются: диаметр, обжатие, скорость, усилие, мощность и т.д.
 */

import type { InputParams, BasicCalculations, BlockCalculation } from '../model/types';
import {
  PHYSICAL_CONSTANTS,
  CALCULATION_COEFFICIENTS,
  BLOCK_PARAMETERS,
} from '../model/constants';

/**
 * Расчет единичного обжатия для блока
 * Формула из Excel (строка 18): AVREDN + (TAPER * (L2 - blockNumber) / 100)
 * где TAPER = коэффициент распределения
 *
 * @param blockNumber - Номер блока
 * @param averageBlockNumber - Номер блока со средним обжатием
 * @param averageReduction - Среднее обжатие, %
 * @param distributionCoeff - Коэффициент распределения
 * @param unitReduction - 1 ед. обжатие (если задано)
 * @param startBlock - Начальный блок
 * @returns Единичное обжатие, %
 */
function calculateUnitReduction(
  blockNumber: number,
  averageBlockNumber: number,
  averageReduction: number,
  distributionCoeff: number,
  unitReduction: number,
  startBlock: number
): number {
  // Если задано 1 ед. обжатие и это первый блок
  if (unitReduction > 0 && blockNumber === startBlock) {
    return unitReduction;
  }

  // Иначе рассчитываем по формуле
  // averageReduction приходит в %, конвертируем в доли для расчета
  const averageReductionDecimal = averageReduction / 100;
  const taper = (distributionCoeff * (averageBlockNumber - blockNumber)) / 100;
  const reductionDecimal = averageReductionDecimal + taper;

  // Возвращаем в процентах
  return Number((reductionDecimal * 100).toFixed(4));
}

/**
 * Расчет диаметра после прохождения через блок
 * Формула из Excel (строка 19): sqrt((d_prev^2) * (1 - unitReduction))
 *
 * @param previousDiameter - Предыдущий диаметр, мм
 * @param unitReduction - Единичное обжатие, десятичная дробь (0.20 = 20%)
 * @returns Диаметр после блока, мм
 */
function calculateDiameter(previousDiameter: number, unitReduction: number): number {
  const diameter = Math.sqrt(Math.pow(previousDiameter, 2) * (1 - unitReduction / 100));
  return Number(diameter.toFixed(4));
}

/**
 * Расчет общего обжатия от начала
 * Формула из Excel (строка 17): (INSIZE^2 - diameter^2) / INSIZE^2
 *
 * @param initialSize - Начальный диаметр, мм
 * @param currentDiameter - Текущий диаметр, мм
 * @returns Общее обжатие, %
 */
function calculateTotalReductionAtBlock(initialSize: number, currentDiameter: number): number {
  const reduction =
    (Math.pow(initialSize, 2) - Math.pow(currentDiameter, 2)) / Math.pow(initialSize, 2);
  return Number((reduction * 100).toFixed(2));
}

/**
 * Расчет предела прочности σв
 * АЛЬТЕРНАТИВНАЯ ФОРМУЛА (v3-coeff)
 *
 * Отличия от Excel-версии:
 * - Коэффициент уменьшен с 0.6 до 0.4
 * - Это даёт примерно на 33% меньшие приращения ВСР
 *
 * Формула:
 * σв = σ₀ + (0.4 * (C + INSIZE/40 + unitReduction) * totalReduction) / ((LOG(100 - totalReduction))/2 + 0.0005 * totalReduction)
 *
 * @param prevStrength - Предыдущий предел прочности, кгс/мм²
 * @param carbonContent - Содержание углерода (0.82 для 82%)
 * @param initialSize - Начальный диаметр, мм
 * @param totalReduction - Общее обжатие, % (89.44 для 89.44%)
 * @param unitReduction - Единичное обжатие блока, % (19.9 для 19.9%)
 * @returns Предел прочности, кгс/мм²
 */
function calculateTensileStrength(
  prevStrength: number,
  carbonContent: number,
  initialSize: number,
  totalReduction: number,
  unitReduction: number
): number {
  // Коэффициент уменьшен с 0.6 до 0.4 для более консервативных значений
  const STRENGTH_COEFFICIENT = 0.4;

  // Numerator: 0.4 * (carbonContent + INSIZE/40 + unitReduction/100) * totalReduction
  const numerator =
    STRENGTH_COEFFICIENT *
    (carbonContent + initialSize / 40 + unitReduction / 100) *
    totalReduction;

  // В Excel LOG() = log₁₀, в JS используем Math.log10()
  // Denominator: (LOG(100 - N$17*100))/2 + 0.0005 * N$17*100
  const denominator =
    Math.log10(100 - totalReduction) / 2 + 0.0005 * totalReduction;

  const increment = numerator / denominator;
  const strength = prevStrength + increment;

  return Number(strength.toFixed(2));
}

/**
 * Расчет STRAIN (напряжение)
 * Формула из Excel (строка 33): 2 * LN(INSIZE / diameter)
 *
 * @param initialSize - Начальный диаметр, мм
 * @param currentDiameter - Текущий диаметр, мм
 * @returns STRAIN
 */
function calculateStrain(initialSize: number, currentDiameter: number): number {
  const strain = 2 * Math.log(initialSize / currentDiameter);
  return Number(strain.toFixed(4));
}

/**
 * Расчет скорости по блокам
 * Формула из Excel (строка 24): FINSPD * (FINSIZE / diameter)^2
 *
 * @param finalSize - Конечный диаметр, мм
 * @param currentDiameter - Текущий диаметр, мм
 * @param drawingVelocity - Конечная скорость волочения, м/с
 * @returns Скорость на блоке, м/с
 */
function calculateSpeed(
  finalSize: number,
  currentDiameter: number,
  drawingVelocity: number
): number {
  const speed = drawingVelocity * Math.pow(finalSize / currentDiameter, 2);
  return Number(speed.toFixed(3));
}

/**
 * Расчет площади поперечного сечения
 * Формула из Excel (строка 34): diameter^2 * π / 4
 *
 * @param diameter - Диаметр, мм
 * @returns Площадь, мм²
 */
function calculateCrossSectionArea(diameter: number): number {
  const area = (Math.pow(diameter, 2) * PHYSICAL_CONSTANTS.PI) / 4;
  return Number(area.toFixed(4));
}

/**
 * Расчет усилия волочения
 * Формула из Excel (строка 28): (crossSectionArea * 0.8) * (unitReduction + 0.3) * prevStrength
 *
 * @param crossSectionArea - Площадь сечения до входа в волоку, мм²
 * @param unitReduction - Единичное обжатие, десятичная дробь
 * @param tensileStrength - Предел прочности, кгс/мм²
 * @returns Усилие волочения, Н
 */
function calculateDrawingForce(
  crossSectionArea: number,
  unitReduction: number,
  tensileStrength: number
): number {
  const force =
    crossSectionArea *
    CALCULATION_COEFFICIENTS.FORCE_FACTOR *
    (unitReduction / 100 + CALCULATION_COEFFICIENTS.FORCE_ADDITION) *
    tensileStrength;
  return Number(force.toFixed(2));
}

/**
 * Расчет RPM блока
 * Формула из Excel (строка 36): speed * 60 / 2.83
 *
 * @param speed - Скорость, м/с
 * @returns RPM
 */
function calculateBlockRPM(speed: number): number {
  const rpm = (speed * 60) / BLOCK_PARAMETERS.BLOCK_RPM_DIVISOR;
  return Number(rpm.toFixed(2));
}

/**
 * Расчет мощности
 * Формула из Excel (строка 29): (((force * blockDiameter / 2000)) * rpm) / 9550
 *
 * @param force - Усилие волочения, Н
 * @param blockDiameter - Диаметр блока, мм
 * @param rpm - RPM блока
 * @returns Мощность
 */
function calculatePower(force: number, blockDiameter: number, rpm: number): number {
  const power = (((force * blockDiameter) / 2000) * rpm) / CALCULATION_COEFFICIENTS.POWER_DIVISOR;
  return Number(power.toFixed(2));
}

/**
 * Расчет полезной мощности
 * Формула из Excel (строка 30): IF(speed > minSpeed, 103, 103 * speed / minSpeed)
 *
 * @param speed - Скорость, м/с
 * @param minSpeed - Минимальная скорость, м/с
 * @returns Полезная мощность
 */
function calculateUsefulPower(speed: number, minSpeed: number): number {
  if (speed > minSpeed) {
    return CALCULATION_COEFFICIENTS.USEFUL_POWER_MAX;
  }
  const power = (CALCULATION_COEFFICIENTS.USEFUL_POWER_MAX * speed) / minSpeed;
  return Number(power.toFixed(2));
}

/**
 * Расчет повышения температуры
 * Формулы из Excel (строки 31-32):
 * Fahrenheit: (((force * 4445.4) / crossSectionArea) * 1.069) / 10000
 * Celsius: (tempF - 32) * 5/9
 *
 * @param force - Усилие волочения, Н
 * @param crossSectionArea - Площадь сечения после выхода, мм²
 * @returns Температура {fahrenheit, celsius}
 */
function calculateTemperatureRise(
  force: number,
  crossSectionArea: number
): { fahrenheit: number; celsius: number } {
  const tempF =
    (((force * CALCULATION_COEFFICIENTS.TEMP_RISE_MULTIPLIER) / crossSectionArea) *
      CALCULATION_COEFFICIENTS.TEMP_RISE_FACTOR) /
    CALCULATION_COEFFICIENTS.TEMP_RISE_DIVISOR;

  const tempC =
    (tempF - CALCULATION_COEFFICIENTS.FAHRENHEIT_TO_CELSIUS_OFFSET) *
    CALCULATION_COEFFICIENTS.FAHRENHEIT_TO_CELSIUS_FACTOR;

  return {
    fahrenheit: Number(tempF.toFixed(2)),
    celsius: Number(tempC.toFixed(2)),
  };
}

/**
 * Выполняет расчеты для всех блоков (Этап 2)
 *
 * @param basic - Результаты базовых расчетов
 * @param params - Входные параметры
 * @returns Массив расчетов для каждого блока
 */
export function calculateBlocksStage(
  basic: BasicCalculations,
  params: InputParams
): BlockCalculation[] {
  const {
    initialWireSize,
    finalWireSize,
    totalTransitions,
    drawingVelocity,
    startBlock,
    unitReduction,
    carbonContent,
    patentedTensileStrength,
  } = params;

  const blocks: BlockCalculation[] = [];
  let previousDiameter = initialWireSize;
  let previousStrengthMin = patentedTensileStrength.min;
  let previousStrengthMax = patentedTensileStrength.max;

  // Номер последнего активного блока (блок перед намоткой)
  const lastActiveBlock = startBlock + totalTransitions - 1;

  for (let blockNum = 1; blockNum <= BLOCK_PARAMETERS.MAX_BLOCKS; blockNum++) {
    // Проверяем, активен ли блок
    const isActive = blockNum >= startBlock && blockNum <= lastActiveBlock;

    if (!isActive) {
      // Блок пропущен
      blocks.push({
        blockNumber: blockNum,
        isOmitted: true,
      } as BlockCalculation);
      continue;
    }

    // Расчет единичного обжатия
    const unitReductionValue = calculateUnitReduction(
      blockNum,
      basic.averageBlockNumber,
      basic.averageReduction,
      basic.distributionCoefficient,
      unitReduction,
      startBlock
    );

    // Расчет диаметра
    // Для последнего активного блока используем точно finalWireSize
    const diameter = blockNum === lastActiveBlock
      ? finalWireSize
      : calculateDiameter(previousDiameter, unitReductionValue);

    // Расчет общего обжатия от начала
    const totalReductionValue = calculateTotalReductionAtBlock(initialWireSize, diameter);

    // Расчет площадей сечения
    const crossSectionAreaBefore = calculateCrossSectionArea(previousDiameter);
    const crossSectionAreaAfter = calculateCrossSectionArea(diameter);

    // Расчет STRAIN
    const strain = calculateStrain(initialWireSize, diameter);

    // Расчет прочности (два варианта по углероду)
    // D13 в Excel = начальная прочность патентованной заготовки (не накопленная!)
    // totalReductionValue = общее обжатие (N$17) в процентах
    // unitReductionValue = единичное обжатие блока (N18) в процентах
    const strengthMin = calculateTensileStrength(
      patentedTensileStrength.min,
      carbonContent.min,
      initialWireSize,
      totalReductionValue,
      unitReductionValue
    );

    const strengthMax = calculateTensileStrength(
      patentedTensileStrength.max,
      carbonContent.max,
      initialWireSize,
      totalReductionValue,
      unitReductionValue
    );

    // Используем среднее значение для последующих расчетов
    const strengthCalculated = (strengthMin + strengthMax) / 2;

    // Расчет скорости
    const speed = calculateSpeed(finalWireSize, diameter, drawingVelocity);

    // Расчет усилия волочения
    const drawingForce = calculateDrawingForce(
      crossSectionAreaBefore,
      unitReductionValue,
      previousStrengthMin
    );

    // Расчет RPM
    const blockRPM = calculateBlockRPM(speed);
    const motorRPM = (speed / 6) * BLOCK_PARAMETERS.MOTOR_RPM_MULTIPLIER; // Упрощенная формула

    // Расчет мощности
    const power = calculatePower(drawingForce, PHYSICAL_CONSTANTS.BLOCK_DIAMETER, blockRPM);

    // Расчет повышения температуры
    const temperatureRise = calculateTemperatureRise(drawingForce, crossSectionAreaAfter);

    // Для расчета полезной мощности нужна минимальная скорость
    // Упрощенно берем половину от максимальной (из Excel видно разные значения для блоков)
    const maxSpeed = speed * 1.2; // Примерное значение
    const minSpeed = maxSpeed / 2;
    const usefulPower = calculateUsefulPower(speed, minSpeed);

    blocks.push({
      blockNumber: blockNum,
      unitReduction: unitReductionValue,
      totalReduction: totalReductionValue,
      diameter,
      tensileStrength: {
        min: strengthMin,
        max: strengthMax,
        calculated: strengthCalculated,
      },
      speed,
      maxSpeed,
      minSpeed,
      drawingForce,
      power,
      usefulPower,
      temperatureRise,
      strain,
      crossSectionArea: crossSectionAreaBefore,
      blockDiameter: PHYSICAL_CONSTANTS.BLOCK_DIAMETER,
      blockRPM,
      motorRPM,
      isOmitted: false,
    });

    // Обновляем для следующего блока
    previousDiameter = diameter;
    previousStrengthMin = strengthMin;
    previousStrengthMax = strengthMax;
  }

  return blocks;
}
