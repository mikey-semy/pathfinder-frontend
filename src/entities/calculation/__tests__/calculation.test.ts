/**
 * Тестирование calculation engine
 * Проверяем расчеты на данных из Excel
 */

import { calculateWireDrawingRoute } from '../lib/calculationEngine';
import type { InputParams } from '../model/types';

/**
 * Тестовые данные из Excel файла
 * Входные параметры из строк 3-13
 */
const testParams: InputParams = {
  rodType: 'k85',
  initialWireSize: 4.0,               // E4
  finalWireSize: 1.3,                 // E5
  carbonContent: {
    min: 0.75,                        // D12
    max: 0.85,                        // E12
  },
  patentedTensileStrength: {
    min: 130,                         // D13
    max: 133,                         // E13
  },
  totalTransitions: 9,                // E7
  unitReduction: 0,                   // E6
  drawingVelocity: 9.0,               // E9
  startBlock: 1,                      // E10
  lastDieReduction: 20,               // L5
};

console.log('🧪 Тестирование PathFinder Calculation Engine\n');
console.log('='.repeat(80));
console.log('ВХОДНЫЕ ПАРАМЕТРЫ:');
console.log('='.repeat(80));
console.log(`Тип заготовки: ${testParams.rodType}`);
console.log(`Диаметр заготовки: ${testParams.initialWireSize} мм`);
console.log(`Диаметр проволоки: ${testParams.finalWireSize} мм`);
console.log(`Содержание углерода: ${testParams.carbonContent.min}-${testParams.carbonContent.max}%`);
console.log(`σв заготовки: ${testParams.patentedTensileStrength.min}-${testParams.patentedTensileStrength.max} кгс/мм²`);
console.log(`Количество переходов: ${testParams.totalTransitions}`);
console.log(`Скорость волочения: ${testParams.drawingVelocity} м/с`);
console.log(`Начать с блока: ${testParams.startBlock}`);
console.log(`Обжатие последней: ${testParams.lastDieReduction}%\n`);

// Выполняем расчет
console.log('⚙️  Выполнение расчета...\n');
const result = calculateWireDrawingRoute(testParams);

// Выводим результаты
console.log('='.repeat(80));
console.log('ЭТАП 1: БАЗОВЫЕ РАСЧЕТЫ');
console.log('='.repeat(80));
console.log(`Суммарное обжатие: ${result.basic.totalReduction}% (ожидается ~89.44%)`);
console.log(`Среднее обжатие: ${result.basic.averageReduction}% (ожидается ~22.10%)`);
console.log(`Коэффициент распределения: ${result.basic.distributionCoefficient}`);
console.log(`Входная скорость: ${result.basic.inputSpeed} м/с`);
console.log(`Производительность: ${result.basic.kgPerHour} кг/ч`);
console.log(`Производительность: ${result.basic.tonnesPer8Hours} тонн/8ч`);
console.log(`Блок со средним обжатием: ${result.basic.averageBlockNumber}\n`);

console.log('='.repeat(80));
console.log('ЭТАП 2: РАСЧЕТЫ ПО БЛОКАМ');
console.log('='.repeat(80));

// Выводим таблицу с результатами
console.log('\nБлок | Диаметр (мм) | Обжатие (%) | Скорость (м/с) | Мощность | σв (кгс/мм²)');
console.log('-'.repeat(80));

result.blocks.forEach((block) => {
  if (block.isOmitted) {
    console.log(`  ${block.blockNumber}  | OMIT`);
  } else {
    const diameter = block.diameter.toFixed(3).padStart(10);
    const reduction = block.unitReduction.toFixed(2).padStart(10);
    const speed = block.speed.toFixed(2).padStart(12);
    const power = block.power.toFixed(2).padStart(8);
    const strength = block.tensileStrength.calculated.toFixed(1).padStart(12);

    console.log(`  ${block.blockNumber}  | ${diameter} | ${reduction} | ${speed} | ${power} | ${strength}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('ЭТАП 3: ИТОГОВЫЕ ПОКАЗАТЕЛИ');
console.log('='.repeat(80));
console.log(`Требуемая мощность: ${result.summary.totalPowerRequired} кВт`);
console.log(`Доступная мощность: ${result.summary.totalPowerAvailable} кВт`);
console.log(`Использование мощности: ${result.summary.powerUtilization}%`);
console.log(`Удлинение проволоки: ${result.summary.wireElongation}`);
console.log(`Конечный σв: ${result.summary.finalTensileStrength.min}-${result.summary.finalTensileStrength.max} кгс/мм²\n`);

console.log('='.repeat(80));
console.log('✅ Расчет завершен!');
console.log('='.repeat(80));
console.log('\n📊 Детальные данные:');
console.log(JSON.stringify(result, null, 2));

// Экспортируем для использования в других файлах
export { testParams, result };
