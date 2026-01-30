/**
 * Публичный API модуля расчетов
 */

// Основной движок
export { calculateWireDrawingRoute } from './lib/calculationEngine';

// Отдельные этапы (опционально)
export {
  calculateBasicStage,
  calculateBlocksStage,
  calculateSummaryStage,
} from './lib/calculationEngine';

// Типы
export type {
  InputParams,
  BasicCalculations,
  BlockCalculation,
  SummaryCalculations,
  CalculationResult,
  ValidationResult,
} from './model/types';

// Константы
export { DEFAULT_VALUES, VALIDATION_RANGES } from './model/constants';

// Марки стали
export {
  STEEL_GRADES,
  getSteelGradeById,
  getSteelGradeOptions,
  type SteelGrade,
} from './model/steelGrades';
