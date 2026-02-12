/**
 * Типы для фичи формы расчета
 */

import type { InputParams } from '@/entities/calculation';
import type { PathfinderFormData } from './schema';

// Константы для преобразования единиц
const KGF_TO_NEWTON = 9.81;
const NEWTON_TO_KGF = 1 / KGF_TO_NEWTON;

/**
 * Преобразует данные формы в параметры для calculation engine
 * Форма принимает σв в Н/мм², но calculation engine работает в кгс/мм²
 */
export function formDataToInputParams(
  formData: PathfinderFormData
): InputParams {
  return {
    rodType: formData.rodType,
    drawingType: formData.drawingType,
    initialWireSize: formData.initialWireSize,
    finalWireSize: formData.finalWireSize,
    carbonContent: {
      min: formData.carbonContentMin,
      max: formData.carbonContentMax,
    },
    patentedTensileStrength: {
      // Конвертируем из Н/мм² в кгс/мм² для расчётов
      min: formData.patentedTensileStrengthMin * NEWTON_TO_KGF,
      max: formData.patentedTensileStrengthMax * NEWTON_TO_KGF,
    },
    totalTransitions: formData.totalTransitions,
    unitReduction: 0, // Не используется, задается по умолчанию
    drawingVelocity: formData.drawingVelocity,
    startBlock: formData.startBlock,
    lastDieReduction: 20, // Не используется, задается по умолчанию
  };
}

/**
 * Преобразует параметры calculation engine в данные формы
 * Calculation engine работает в кгс/мм², форма отображает Н/мм²
 */
export function inputParamsToFormData(
  params: InputParams
): PathfinderFormData {
  return {
    rodType: params.rodType,
    drawingType: params.drawingType,
    initialWireSize: params.initialWireSize,
    finalWireSize: params.finalWireSize,
    carbonContentMin: params.carbonContent.min,
    carbonContentMax: params.carbonContent.max,
    // Конвертируем из кгс/мм² в Н/мм² для отображения
    patentedTensileStrengthMin: Math.round(params.patentedTensileStrength.min * KGF_TO_NEWTON),
    patentedTensileStrengthMax: Math.round(params.patentedTensileStrength.max * KGF_TO_NEWTON),
    totalTransitions: params.totalTransitions,
    drawingVelocity: params.drawingVelocity,
    startBlock: params.startBlock,
  };
}
