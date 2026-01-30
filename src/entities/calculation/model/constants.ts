/**
 * Константы для расчетов волочения
 */

/**
 * Физические константы
 */
export const PHYSICAL_CONSTANTS = {
  PI: 3.142,                          // Используем значение из Excel
  DENSITY_FACTOR: 22.2112,            // Коэффициент плотности для расчета кг/час
  GRAVITY: 9.81,                      // Ускорение свободного падения, м/с²
  BLOCK_DIAMETER: 900,                // Диаметр блока по умолчанию, мм
} as const;

/**
 * Коэффициенты для расчетов
 */
export const CALCULATION_COEFFICIENTS = {
  FORCE_FACTOR: 0.8,                  // Коэффициент для усилия волочения
  FORCE_ADDITION: 0.3,                // Добавка к обжатию для усилия
  POWER_DIVISOR: 9550,                // Делитель для расчета мощности
  USEFUL_POWER_MAX: 103,              // Максимальная полезная мощность
  TEMP_RISE_MULTIPLIER: 4445.4,       // Множитель для расчета температуры
  TEMP_RISE_FACTOR: 1.069,            // Фактор для расчета температуры
  TEMP_RISE_DIVISOR: 10000,           // Делитель для расчета температуры
  FAHRENHEIT_TO_CELSIUS_OFFSET: 32,   // Смещение для °F -> °C
  FAHRENHEIT_TO_CELSIUS_FACTOR: 5/9,  // Фактор для °F -> °C
} as const;

/**
 * Параметры блоков
 */
export const BLOCK_PARAMETERS = {
  MAX_BLOCKS: 19,                     // Максимальное количество блоков
  BLOCK_RPM_DIVISOR: 2.83,            // Делитель для расчета Block RPM
  MOTOR_RPM_MULTIPLIER: 1720,         // Множитель для расчета Motor RPM
} as const;

/**
 * Параметры производительности
 */
export const PRODUCTION_PARAMETERS = {
  HOURS_PER_SHIFT: 12,                // Часов в смену
  UTILIZATION_FACTOR: 0.75,           // Коэффициент загрузки (75%)
  KG_TO_TONNES: 1000,                 // Перевод кг в тонны
} as const;

/**
 * Диапазоны валидации
 */
export const VALIDATION_RANGES = {
  initialWireSize: { min: 4, max: 8 },              // Диаметр заготовки, мм
  finalWireSize: { min: 0.8, max: 4 },              // Диаметр проволоки, мм
  totalTransitions: { min: 1, max: 19 },            // Количество переходов
  drawingVelocity: { min: 0.1, max: 20 },           // Скорость волочения, м/с
  startBlock: { min: 1, max: 10 },                  // Начальный блок
  lastDieReduction: { min: 0, max: 100 },           // Обжатие, %
  carbonContent: { min: 0, max: 2 },                // Содержание углерода, %
  tensileStrength: { min: 0, max: 5000 },           // Предел прочности, Н/мм²
} as const;

/**
 * Значения по умолчанию
 */
export const DEFAULT_VALUES = {
  rodType: 'k85',
  initialWireSize: 4.0,
  finalWireSize: 1.3,
  carbonContent: {
    min: 0.75,
    max: 0.85,
  },
  patentedTensileStrength: {
    min: 130,
    max: 133,
  },
  totalTransitions: 9,
  unitReduction: 0,
  drawingVelocity: 9.0,
  startBlock: 1,
  lastDieReduction: 20,
} as const;

/**
 * Формулы для расчета предела прочности σв
 * Коэффициенты для формулы: σв = a + b * STRAIN
 */
export const TENSILE_STRENGTH_FORMULA = {
  // Коэффициент для расчета приращения прочности
  STRENGTH_FACTOR: 0.6,

  // Добавка к содержанию углерода
  CARBON_ADDITION_DIVISOR: 40,

  // Коэффициент в знаменателе
  DENOMINATOR_FACTOR: 0.0005,
} as const;
