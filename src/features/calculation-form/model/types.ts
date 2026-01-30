/**
 * Типы для фичи формы расчета
 */

import type { InputParams } from '@/entities/calculation';
import type { PathfinderFormData } from './schema';

/**
 * Преобразует данные формы в параметры для calculation engine
 */
export function formDataToInputParams(
  formData: PathfinderFormData
): InputParams {
  return {
    rodType: formData.rodType,
    initialWireSize: formData.initialWireSize,
    finalWireSize: formData.finalWireSize,
    carbonContent: {
      min: formData.carbonContentMin,
      max: formData.carbonContentMax,
    },
    patentedTensileStrength: {
      min: formData.patentedTensileStrengthMin,
      max: formData.patentedTensileStrengthMax,
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
 */
export function inputParamsToFormData(
  params: InputParams
): PathfinderFormData {
  return {
    rodType: params.rodType,
    initialWireSize: params.initialWireSize,
    finalWireSize: params.finalWireSize,
    carbonContentMin: params.carbonContent.min,
    carbonContentMax: params.carbonContent.max,
    patentedTensileStrengthMin: params.patentedTensileStrength.min,
    patentedTensileStrengthMax: params.patentedTensileStrength.max,
    totalTransitions: params.totalTransitions,
    drawingVelocity: params.drawingVelocity,
    startBlock: params.startBlock,
  };
}
