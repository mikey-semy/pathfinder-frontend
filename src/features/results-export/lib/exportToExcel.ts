/**
 * Экспорт результатов расчета в Excel
 * Использует библиотеку xlsx
 * Всё на одном листе для удобной печати
 */

import * as XLSX from 'xlsx';
import type { CalculationResult } from '@/entities/calculation';

/**
 * Экспорт результатов в Excel файл (один лист)
 */
export function exportToExcel(result: CalculationResult, filename?: string) {
  const workbook = XLSX.utils.book_new();
  const activeBlocks = result.blocks.filter((block) => !block.isOmitted);

  // Вычисляем ВСР ГП
  const vsrGpMin = result.summary.finalTensileStrengthNewtons?.min
    ?? Number(((result.summary.finalTensileStrength.min - 5) * 9.81).toFixed(2));
  const vsrGpMax = result.summary.finalTensileStrengthNewtons?.max
    ?? Number(((result.summary.finalTensileStrength.max - 5) * 9.81).toFixed(2));

  // Собираем все данные на один лист
  const data: (string | number)[][] = [
    // Заголовок
    ['PATHFINDER - Расчет маршрута волочения'],
    ['Дата:', new Date(result.timestamp).toLocaleString('ru-RU')],
    [],

    // Секция 1: Входные параметры (компактно в 2 колонки)
    ['ВХОДНЫЕ ПАРАМЕТРЫ', '', 'БАЗОВЫЕ РАСЧЕТЫ'],
    ['Марка стали', result.inputs.rodType, 'Общее обжатие (%)', result.basic.totalReduction],
    ['Диаметр заготовки (мм)', result.inputs.initialWireSize, 'Среднее обжатие (%)', result.basic.averageReduction],
    ['Диаметр готовой (мм)', result.inputs.finalWireSize, 'Коэфф. распределения', result.basic.distributionCoefficient],
    ['Переходов', result.inputs.totalTransitions, 'Вх. скорость (м/с)', result.basic.inputSpeed],
    ['Скорость (м/с)', result.inputs.drawingVelocity, 'Произв. (кг/ч)', result.basic.kgPerHour],
    ['Обж. посл. волоки (%)', result.inputs.lastDieReduction, 'Произв. (т/8ч)', result.basic.tonnesPer8Hours],
    [],

    // Секция 2: Итоговые показатели
    ['ИТОГОВЫЕ ПОКАЗАТЕЛИ'],
    ['Треб. мощность (кВт)', result.summary.totalPowerRequired, 'σв мин (кгс/мм²)', result.summary.finalTensileStrength.min],
    ['Дост. мощность (кВт)', result.summary.totalPowerAvailable, 'σв макс (кгс/мм²)', result.summary.finalTensileStrength.max],
    ['Исп. мощности (%)', result.summary.powerUtilization, 'ВСР ГП мин (Н/мм²)', vsrGpMin],
    ['Удлинение', result.summary.wireElongation, 'ВСР ГП макс (Н/мм²)', vsrGpMax],
    [],

    // Секция 3: Расчет по блокам (компактная таблица)
    ['РАСЧЕТ ПО БЛОКАМ'],
    ['№', 'Обж.%', 'Σ Обж.%', 'Ø мм', 'σв мин', 'σв макс', 'V м/с', 'F Н', 'P кВт', 't°C'],
    ...activeBlocks.map((block) => [
      block.blockNumber,
      Number(block.unitReduction.toFixed(2)),
      Number(block.totalReduction.toFixed(2)),
      Number(block.diameter.toFixed(3)),
      Number(block.tensileStrength.min.toFixed(0)),
      Number(block.tensileStrength.max.toFixed(0)),
      Number(block.speed.toFixed(2)),
      Number(block.drawingForce.toFixed(0)),
      Number(block.power.toFixed(2)),
      Number(block.temperatureRise.celsius.toFixed(0)),
    ]),
  ];

  // Создаем лист
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Устанавливаем ширину колонок (компактно для печати)
  worksheet['!cols'] = [
    { wch: 18 }, // A
    { wch: 10 }, // B
    { wch: 18 }, // C
    { wch: 10 }, // D
    { wch: 8 },  // E
    { wch: 8 },  // F
    { wch: 8 },  // G
    { wch: 8 },  // H
    { wch: 8 },  // I
    { wch: 6 },  // J
  ];

  // Настройки печати
  worksheet['!print'] = {
    area: worksheet['!ref'],
  };

  // Добавляем границы ко всем ячейкам с данными
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: '', t: 's' };
      }
      worksheet[cellAddress].s = {
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Расчет');

  // Сохранение файла
  const fileName =
    filename ||
    `pathfinder_${new Date(result.timestamp).toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
