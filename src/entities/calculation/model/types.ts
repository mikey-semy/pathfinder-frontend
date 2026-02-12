/**
 * Типы данных для расчета маршрутов волочения
 */

/**
 * Тип волочения
 */
export type DrawingType = 'dry' | 'wet';

/**
 * Входные параметры для расчета
 */
export interface InputParams {
  // Параметры заготовки
  rodType: string;                    // Тип заготовки (например, 85)
  initialWireSize: number;            // Диаметр заготовки, мм (E4)
  finalWireSize: number;              // Диаметр готовой проволоки, мм (E5)
  drawingType: DrawingType;           // Тип волочения (сухое/мокрое)
  carbonContent: {
    min: number;                      // Минимум содержания углерода, % (D12)
    max: number;                      // Максимум содержания углерода, % (E12)
  };
  patentedTensileStrength: {
    min: number;                      // Минимум σв патентованной заготовки, кгс/мм² (D13)
    max: number;                      // Максимум σв патентованной заготовки, кгс/мм² (E13)
  };

  // Параметры процесса
  totalTransitions: number;           // Количество переходов (E7)
  unitReduction: number;              // 1 ед. обжатие, % (E6)
  drawingVelocity: number;            // Скорость волочения, м/с (E9)
  startBlock: number;                 // Начать с блока № (E10)
  lastDieReduction: number;           // Обжатие в последней волоке, % (L5)
}

/**
 * Базовые расчеты (Этап 1)
 */
export interface BasicCalculations {
  totalReduction: number;             // Суммарное обжатие, % (L3)
  averageReduction: number;           // Среднее единичное обжатие, % (L4)
  distributionCoefficient: number;    // Коэффициент распределения (E11)
  inputSpeed: number;                 // Входная скорость, м/с (L8)
  kgPerHour: number;                  // Производительность, кг/час (K10)
  tonnesPer8Hours: number;            // Производительность, тонн/8ч (K11)
  averageBlockNumber: number;         // Номер блока со средним обжатием (L7)
}

/**
 * Расчет для одного блока (Этап 2)
 */
export interface BlockCalculation {
  blockNumber: number;                // Номер блока (1-11)

  // Основные параметры
  unitReduction: number;              // Единичное обжатие, % (строка 18)
  totalReduction: number;             // Общее обжатие, % (строка 17)
  diameter: number;                   // Диаметр по переходам, мм (строка 19)

  // Прочность
  tensileStrength: {
    min: number;                      // σв кгс/мм² (строка 20)
    max: number;                      // σв кгс/мм² (строка 21)
    calculated: number;               // σв кгс/мм² (строка 22)
  };

  // Скорости
  speed: number;                      // Скорость по блокам, м/с (строка 24)
  maxSpeed: number;                   // MAX скорость (строка 26)
  minSpeed: number;                   // MIN скорость (строка 27)

  // Усилия и мощность
  drawingForce: number;               // Усилие волочения, Н (строка 28)
  power: number;                      // Мощность (строка 29)
  usefulPower: number;                // Полезная мощность (строка 30)

  // Температура
  temperatureRise: {
    fahrenheit: number;               // temp rise °F (строка 31)
    celsius: number;                  // temp rise °C (строка 32)
  };

  // Геометрия и механика
  strain: number;                     // STRAIN - напряжение (строка 33)
  crossSectionArea: number;           // Площадь поперечного сечения, мм² (строка 34)
  blockDiameter: number;              // Диаметр блока, мм (строка 35)
  blockRPM: number;                   // BLOCK RPM (строка 36)
  motorRPM: number;                   // MOTOR RPM (строка 37)

  // Статус
  isOmitted: boolean;                 // Блок пропущен (OMIT)
}

/**
 * Итоговые расчеты (Этап 3)
 */
export interface SummaryCalculations {
  totalPowerRequired: number;         // Требуемая мощность, кВт (K40)
  totalPowerAvailable: number;        // Доступная мощность, кВт (K41)
  powerUtilization: number;           // Использование мощности, %
  wireElongation: number;             // Удлинение проволоки (E40)
  finalTensileStrength: {
    min: number;                      // Конечный предел прочности, кгс/мм² (мин)
    max: number;                      // Конечный предел прочности, кгс/мм² (макс)
  };
  finalTensileStrengthNewtons: {
    min: number;                      // ВСР ГП, Н/мм² (мин) = (σв мин - 5) * 9.81
    max: number;                      // ВСР ГП, Н/мм² (макс) = (σв макс - 5) * 9.81
  };
}

/**
 * Полный результат расчета
 */
export interface CalculationResult {
  inputs: InputParams;
  basic: BasicCalculations;
  blocks: BlockCalculation[];
  summary: SummaryCalculations;
  timestamp: Date;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}
