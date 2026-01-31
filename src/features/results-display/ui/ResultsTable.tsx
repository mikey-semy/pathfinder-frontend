'use client';

/**
 * Компонент отображения результатов расчета маршрута волочения
 * С возможностью редактирования обжатия, диаметра и σв
 * Последняя строка имеет фиксированный диаметр (заданный в начальных данных)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { CalculationResult } from '@/entities/calculation';

interface ResultsTableProps {
  result: CalculationResult;
}

interface EditableBlock {
  blockNumber: number;
  unitReduction: number;
  diameter: number;
  totalReduction: number;
  tensileStrengthMin: number;
  tensileStrengthMax: number;
}

// Константа для преобразования кгс/мм² в Н/мм²
const KGF_TO_NEWTON = 9.81;

// Компонент редактируемой ячейки
interface EditableCellProps {
  value: number;
  decimals?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  decimals = 2,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value.toFixed(decimals));
  const [isEditing, setIsEditing] = useState(false);
  const prevValueRef = useRef(value);

  // Синхронизация с внешним значением только когда оно реально изменилось извне
  useEffect(() => {
    if (!isEditing && value !== prevValueRef.current) {
      setLocalValue(value.toFixed(decimals));
      prevValueRef.current = value;
    }
  }, [value, decimals, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    if (!isNaN(parsed) && parsed > 0 && parsed !== prevValueRef.current) {
      prevValueRef.current = parsed;
      onChange(parsed);
    } else if (isNaN(parsed) || parsed <= 0) {
      setLocalValue(prevValueRef.current.toFixed(decimals));
    }
    setIsEditing(false);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setLocalValue(prevValueRef.current.toFixed(decimals));
      setIsEditing(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  if (disabled) {
    return (
      <span className="text-muted-foreground font-medium">
        {value.toFixed(decimals)}
      </span>
    );
  }

  return (
    <Input
      type="number"
      step={decimals === 0 ? '1' : decimals === 1 ? '0.1' : '0.01'}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={`h-8 w-20 text-center mx-auto print:border-0 print:bg-transparent print:shadow-none ${className}`}
    />
  );
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  const { basic, blocks, summary, inputs } = result;

  // Фильтруем только активные блоки
  const activeBlocks = blocks.filter((block) => !block.isOmitted);

  // Состояние для редактируемых значений
  const [editableBlocks, setEditableBlocks] = useState<EditableBlock[]>(() =>
    activeBlocks.map((block, index) => ({
      blockNumber: block.blockNumber,
      unitReduction: block.unitReduction,
      diameter: index === activeBlocks.length - 1 ? inputs.finalWireSize : block.diameter,
      totalReduction: block.totalReduction,
      tensileStrengthMin: block.tensileStrength.min,
      tensileStrengthMax: block.tensileStrength.max,
    }))
  );

  // State для отслеживания измененных строк (для анимации)
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());

  // Сбрасываем состояние при изменении результата
  useEffect(() => {
    setEditableBlocks(
      activeBlocks.map((block, index) => ({
        blockNumber: block.blockNumber,
        unitReduction: block.unitReduction,
        diameter: index === activeBlocks.length - 1 ? inputs.finalWireSize : block.diameter,
        totalReduction: block.totalReduction,
        tensileStrengthMin: block.tensileStrength.min,
        tensileStrengthMax: block.tensileStrength.max,
      }))
    );
    setChangedRows(new Set());
  }, [result]);

  // Расчет σв по формуле
  const calculateTensileStrength = useCallback((
    prevStrength: number,
    carbonContent: number,
    initialSize: number,
    totalReduction: number,
    unitReduction: number
  ): number => {
    const numerator =
      0.6 *
      (carbonContent + initialSize / 40 + unitReduction / 100) *
      totalReduction;

    const denominator =
      Math.log10(100 - totalReduction) / 2 + 0.0005 * totalReduction;

    if (denominator <= 0) return prevStrength;

    const increment = numerator / denominator;
    return prevStrength + increment;
  }, []);

  // Пересчет всех значений начиная с указанного индекса
  const recalculateFromIndex = useCallback(
    (startIndex: number, newBlocks: EditableBlock[], changedIndices: Set<number>) => {
      const initialSize = inputs.initialWireSize;
      const finalSize = inputs.finalWireSize;
      const patentedMin = inputs.patentedTensileStrength.min;
      const patentedMax = inputs.patentedTensileStrength.max;
      const carbonMin = inputs.carbonContent.min;
      const carbonMax = inputs.carbonContent.max;
      const lastIndex = newBlocks.length - 1;

      // Пересчитываем диаметры для всех блоков после измененного (кроме последнего)
      for (let i = startIndex + 1; i < lastIndex; i++) {
        const block = newBlocks[i];
        const prevDiameter = newBlocks[i - 1].diameter;
        const newDiameter = Math.sqrt(prevDiameter ** 2 * (1 - block.unitReduction / 100));

        newBlocks[i] = {
          ...block,
          diameter: Math.round(newDiameter * 100) / 100,
        };
        changedIndices.add(i);
      }

      // Последний блок: диаметр фиксирован, пересчитываем обжатие
      if (lastIndex > 0) {
        const prevDiameter = newBlocks[lastIndex - 1].diameter;
        const lastBlock = newBlocks[lastIndex];
        const newReduction = (1 - (finalSize ** 2) / (prevDiameter ** 2)) * 100;

        newBlocks[lastIndex] = {
          ...lastBlock,
          diameter: finalSize,
          unitReduction: Math.max(0.1, Math.min(99.9, newReduction)),
        };
        changedIndices.add(lastIndex);
      }

      // Пересчитываем totalReduction и σв для всех блоков начиная с startIndex
      for (let i = startIndex; i < newBlocks.length; i++) {
        const block = newBlocks[i];

        const totalReduction =
          ((initialSize ** 2 - block.diameter ** 2) / initialSize ** 2) * 100;

        const tensileStrengthMin = calculateTensileStrength(
          patentedMin,
          carbonMin,
          initialSize,
          totalReduction,
          block.unitReduction
        );

        const tensileStrengthMax = calculateTensileStrength(
          patentedMax,
          carbonMax,
          initialSize,
          totalReduction,
          block.unitReduction
        );

        newBlocks[i] = {
          ...block,
          totalReduction,
          tensileStrengthMin,
          tensileStrengthMax,
        };
        changedIndices.add(i);
      }

      return newBlocks;
    },
    [inputs, calculateTensileStrength]
  );

  // Запуск анимации для измененных строк
  const triggerAnimation = useCallback((indices: Set<number>) => {
    setChangedRows(new Set(indices));
    setTimeout(() => {
      setChangedRows(new Set());
    }, 1000);
  }, []);

  // Обработчик изменения обжатия
  const handleReductionChange = useCallback((index: number, value: number) => {
    if (value <= 0 || value >= 100) return;

    setEditableBlocks((prev) => {
      const newBlocks = prev.map((block) => ({ ...block }));
      const prevDiameter =
        index === 0 ? inputs.initialWireSize : newBlocks[index - 1].diameter;

      newBlocks[index] = {
        ...newBlocks[index],
        unitReduction: value,
        diameter: Math.round(Math.sqrt(prevDiameter ** 2 * (1 - value / 100)) * 100) / 100,
      };

      const changedIndices = new Set<number>();
      changedIndices.add(index);
      const result = recalculateFromIndex(index, newBlocks, changedIndices);

      triggerAnimation(changedIndices);
      return result;
    });
  }, [inputs.initialWireSize, recalculateFromIndex, triggerAnimation]);

  // Обработчик изменения диаметра
  const handleDiameterChange = useCallback((index: number, value: number) => {
    if (value <= 0) return;

    setEditableBlocks((prev) => {
      const newBlocks = prev.map((block) => ({ ...block }));
      const prevDiameter =
        index === 0 ? inputs.initialWireSize : newBlocks[index - 1].diameter;

      const newReduction = (1 - (value ** 2) / (prevDiameter ** 2)) * 100;
      if (newReduction <= 0 || newReduction >= 100) return prev;

      newBlocks[index] = {
        ...newBlocks[index],
        diameter: Math.round(value * 100) / 100,
        unitReduction: newReduction,
      };

      const changedIndices = new Set<number>();
      changedIndices.add(index);
      const result = recalculateFromIndex(index, newBlocks, changedIndices);

      triggerAnimation(changedIndices);
      return result;
    });
  }, [inputs.initialWireSize, recalculateFromIndex, triggerAnimation]);

  // Обработчик изменения обжатия последней строки (меняем только предпоследнюю)
  const handleLastRowReductionChange = useCallback((value: number) => {
    if (value <= 0 || value >= 100) return;

    const lastIndex = editableBlocks.length - 1;
    if (lastIndex < 1) return;

    const initialSize = inputs.initialWireSize;
    const finalSize = inputs.finalWireSize;

    // Вычисляем нужный диаметр предпоследней строки
    // reduction = (1 - finalSize² / prevDiameter²) × 100
    // prevDiameter = finalSize / sqrt(1 - reduction/100)
    const newPrevDiameter = finalSize / Math.sqrt(1 - value / 100);

    setEditableBlocks((prev) => {
      const newBlocks = prev.map((block) => ({ ...block }));
      const prevPrevDiameter = lastIndex >= 2 ? newBlocks[lastIndex - 2].diameter : initialSize;

      // Меняем только предпоследнюю строку
      const newPrevReduction = (1 - (newPrevDiameter ** 2) / (prevPrevDiameter ** 2)) * 100;
      newBlocks[lastIndex - 1] = {
        ...newBlocks[lastIndex - 1],
        diameter: newPrevDiameter,
        unitReduction: newPrevReduction,
      };

      // Последняя строка: диаметр фиксирован
      newBlocks[lastIndex] = {
        ...newBlocks[lastIndex],
        diameter: finalSize,
        unitReduction: value,
      };

      // Пересчитываем totalReduction и σв только для изменённых строк
      const changedIndices = new Set<number>([lastIndex - 1, lastIndex]);
      for (const i of changedIndices) {
        const block = newBlocks[i];
        const totalReduction = ((initialSize ** 2 - block.diameter ** 2) / initialSize ** 2) * 100;

        const tensileStrengthMin = calculateTensileStrength(
          inputs.patentedTensileStrength.min,
          inputs.carbonContent.min,
          initialSize,
          totalReduction,
          block.unitReduction
        );

        const tensileStrengthMax = calculateTensileStrength(
          inputs.patentedTensileStrength.max,
          inputs.carbonContent.max,
          initialSize,
          totalReduction,
          block.unitReduction
        );

        newBlocks[i] = {
          ...block,
          totalReduction,
          tensileStrengthMin,
          tensileStrengthMax,
        };
      }

      triggerAnimation(changedIndices);
      return newBlocks;
    });
  }, [editableBlocks.length, inputs, calculateTensileStrength, triggerAnimation]);

  // Обработчик изменения σв (обратный расчет обжатия)
  const handleStrengthChange = useCallback((index: number, valueNewton: number, isMin: boolean) => {
    if (valueNewton <= 0) return;

    const targetStrength = valueNewton / KGF_TO_NEWTON + 5;

    setEditableBlocks((prev) => {
      const newBlocks = prev.map((block) => ({ ...block }));
      const block = newBlocks[index];
      const initialSize = inputs.initialWireSize;
      const patented = isMin ? inputs.patentedTensileStrength.min : inputs.patentedTensileStrength.max;
      const carbon = isMin ? inputs.carbonContent.min : inputs.carbonContent.max;

      let bestReduction = block.unitReduction;
      let minDiff = Infinity;

      for (let testReduction = 5; testReduction <= 40; testReduction += 0.1) {
        const prevDiameter = index === 0 ? initialSize : newBlocks[index - 1].diameter;
        const testDiameter = Math.sqrt(prevDiameter ** 2 * (1 - testReduction / 100));
        const testTotalReduction = ((initialSize ** 2 - testDiameter ** 2) / initialSize ** 2) * 100;

        const testStrength = calculateTensileStrength(
          patented,
          carbon,
          initialSize,
          testTotalReduction,
          testReduction
        );

        const diff = Math.abs(testStrength - targetStrength);
        if (diff < minDiff) {
          minDiff = diff;
          bestReduction = testReduction;
        }
      }

      const prevDiameter = index === 0 ? initialSize : newBlocks[index - 1].diameter;
      newBlocks[index] = {
        ...block,
        unitReduction: Math.round(bestReduction * 100) / 100,
        diameter: Math.round(Math.sqrt(prevDiameter ** 2 * (1 - bestReduction / 100)) * 100) / 100,
      };

      const changedIndices = new Set<number>();
      changedIndices.add(index);
      const result = recalculateFromIndex(index, newBlocks, changedIndices);

      triggerAnimation(changedIndices);
      return result;
    });
  }, [inputs, calculateTensileStrength, recalculateFromIndex, triggerAnimation]);

  // Проверка, можно ли редактировать диаметр (все кроме последней)
  const canEditDiameter = (index: number) => index < editableBlocks.length - 1;
  const isLastRow = (index: number) => index === editableBlocks.length - 1;

  // Получаем итоговые значения из последней строки
  const lastBlock = editableBlocks[editableBlocks.length - 1];
  const finalStrengthMin = lastBlock?.tensileStrengthMin || summary.finalTensileStrength.min;
  const finalStrengthMax = lastBlock?.tensileStrengthMax || summary.finalTensileStrength.max;

  const finalStrengthMinNewton = Math.round(finalStrengthMin * KGF_TO_NEWTON);
  const finalStrengthMaxNewton = Math.round(finalStrengthMax * KGF_TO_NEWTON);
  const vsrGpMin = Math.round((finalStrengthMin - 5) * KGF_TO_NEWTON);
  const vsrGpMax = Math.round((finalStrengthMax - 5) * KGF_TO_NEWTON);

  return (
    <div className="space-y-6">
      {/* Базовые расчеты + Итоговые показатели */}
      <div className="flex flex-col lg:flex-row gap-6 print:hidden">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Базовые расчеты</CardTitle>
            <CardDescription>Общие параметры процесса волочения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Общее обжатие</p>
                <p className="text-2xl font-semibold cursor-help" title="Суммарное обжатие от начальной заготовки до готовой проволоки (%)">{basic.totalReduction.toFixed(2)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Среднее обжатие</p>
                <p className="text-2xl font-semibold cursor-help" title="Среднее единичное обжатие на один переход (%)">{basic.averageReduction.toFixed(2)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Производительность</p>
                <p className="text-2xl font-semibold cursor-help" title="Производительность волочильного стана (кг/ч)">{basic.kgPerHour.toFixed(2)} кг/ч</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">За 8 часов</p>
                <p className="text-2xl font-semibold cursor-help" title="Производительность за 8-часовую смену (тонн)">{basic.tonnesPer8Hours.toFixed(3)} т</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Итоговые показатели</CardTitle>
            <CardDescription>Характеристики готовой проволоки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">σв мин/макс</p>
                <p className="text-xl font-semibold whitespace-nowrap cursor-help" title="Временное сопротивление разрыву готовой проволоки - минимальное/максимальное (Н/мм²)">
                  {finalStrengthMinNewton}-{finalStrengthMaxNewton} Н/мм²
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ВСР ГП</p>
                <p className="text-xl font-semibold whitespace-nowrap cursor-help" style={{ color: 'hsl(140 60% 45%)' }} title="Временное сопротивление разрыву готовой проволоки по ГОСТ (Н/мм²)">
                  {vsrGpMin}-{vsrGpMax} Н/мм²
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Удлинение</p>
                <p className="text-xl font-semibold cursor-help" title="Относительное удлинение готовой проволоки (%)">{summary.wireElongation.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Версия для печати */}
      <div className="hidden print:flex gap-4 text-sm">
        <div className="flex-1 border p-2 rounded">
          <h3 className="font-bold mb-1">Базовые расчеты</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div><span className="text-gray-600 text-xs">Общее обжатие:</span> <strong>{basic.totalReduction.toFixed(2)}%</strong></div>
            <div><span className="text-gray-600 text-xs">Среднее обжатие:</span> <strong>{basic.averageReduction.toFixed(2)}%</strong></div>
            <div><span className="text-gray-600 text-xs">Производит.:</span> <strong>{basic.kgPerHour.toFixed(2)} кг/ч</strong></div>
            <div><span className="text-gray-600 text-xs">За 8 часов:</span> <strong>{basic.tonnesPer8Hours.toFixed(3)} т</strong></div>
          </div>
        </div>
        <div className="flex-1 border p-2 rounded">
          <h3 className="font-bold mb-1">Итоговые показатели</h3>
          <div className="flex flex-col gap-y-1">
            <div><span className="text-gray-600 text-xs">σв мин/макс:</span> <strong>{finalStrengthMinNewton}-{finalStrengthMaxNewton} Н/мм²</strong></div>
            <div><span className="text-gray-600 text-xs">ВСР ГП:</span> <strong>{vsrGpMin}-{vsrGpMax} Н/мм²</strong></div>
            <div><span className="text-gray-600 text-xs">Удлинение:</span> <strong>{summary.wireElongation.toFixed(2)}%</strong></div>
          </div>
        </div>
      </div>

      {/* Таблица по блокам */}
      <Card>
        <CardHeader>
          <CardTitle>Расчет по блокам</CardTitle>
          <CardDescription className="print:hidden">
            Редактируйте значения и нажмите Enter или кликните вне ячейки. Последняя строка имеет фиксированный диаметр.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 print:mx-0 print:px-0 print:overflow-visible">
            <table className="w-full text-sm min-w-[700px] print:min-w-0 print:table-fixed print:border-collapse print:[&_th]:border print:[&_th]:border-gray-300 print:[&_td]:border print:[&_td]:border-gray-300">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card w-12 text-center p-2 font-semibold print:static print:bg-transparent cursor-help" title="Номер блока волочения">Блок</th>
                  <th className="text-center p-2 font-semibold min-w-[80px] cursor-help" title="Единичное обжатие на данном переходе (%)">
                    <div>Обжатие</div>
                    <div className="font-normal text-xs">%</div>
                  </th>
                  <th className="text-center p-2 font-semibold min-w-[80px] cursor-help" title="Диаметр проволоки после прохода через волоку (мм)">
                    <div>Диаметр</div>
                    <div className="font-normal text-xs">мм</div>
                  </th>
                  <th className="text-center p-2 font-semibold min-w-[70px] cursor-help" title="Суммарное обжатие от начала до данного блока (%)">
                    <div>Σ Обжатие</div>
                    <div className="font-normal text-xs">%</div>
                  </th>
                  <th className="text-center p-2 font-semibold min-w-[90px] cursor-help" title="Временное сопротивление разрыву - минимальное (Н/мм²)">
                    <div>σв мин</div>
                    <div className="font-normal text-xs">Н/мм²</div>
                  </th>
                  <th className="text-center p-2 font-semibold min-w-[90px] cursor-help" title="Временное сопротивление разрыву - максимальное (Н/мм²)">
                    <div>σв макс</div>
                    <div className="font-normal text-xs">Н/мм²</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {editableBlocks.map((block, index) => {
                  const isAverage = block.blockNumber === basic.averageBlockNumber;
                  const isLast = isLastRow(index);
                  const isChanged = changedRows.has(index);

                  const strengthMinNewton = Math.round((block.tensileStrengthMin - 5) * KGF_TO_NEWTON);
                  const strengthMaxNewton = Math.round((block.tensileStrengthMax - 5) * KGF_TO_NEWTON);

                  return (
                    <tr
                      key={block.blockNumber}
                      className={`hover:bg-primary/10 transition-colors ${index % 2 === 0 ? 'bg-muted/50' : ''} ${isChanged ? 'animate-highlight' : ''}`}
                    >
                      <td
                        className={`sticky left-0 z-10 p-2 text-center font-medium print:static print:bg-transparent print:border print:border-gray-300 ${isAverage ? 'text-red-500' : ''} ${index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}`}
                        title={isAverage ? 'Блок со средним обжатием' : undefined}
                      >
                        {block.blockNumber}
                      </td>
                      <td className="p-1 text-center">
                        <EditableCell
                          value={block.unitReduction}
                          decimals={2}
                          onChange={(v) => isLast ? handleLastRowReductionChange(v) : handleReductionChange(index, v)}
                        />
                      </td>
                      <td className="p-1 text-center">
                        {!isLast ? (
                          <EditableCell
                            value={block.diameter}
                            decimals={2}
                            onChange={(v) => handleDiameterChange(index, v)}
                          />
                        ) : (
                          <span className="font-bold print:text-black">
                            {block.diameter.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">{block.totalReduction.toFixed(2)}</td>
                      <td className="p-1 text-center">
                        {!isLast ? (
                          <EditableCell
                            value={strengthMinNewton}
                            decimals={0}
                            onChange={(v) => handleStrengthChange(index, v, true)}
                          />
                        ) : (
                          <span className="font-bold print:!text-black" style={{ color: 'hsl(140 60% 45%)' }}>
                            {strengthMinNewton}
                          </span>
                        )}
                      </td>
                      <td className="p-1 text-center">
                        {!isLast ? (
                          <EditableCell
                            value={strengthMaxNewton}
                            decimals={0}
                            onChange={(v) => handleStrengthChange(index, v, false)}
                          />
                        ) : (
                          <span className="font-bold print:!text-black" style={{ color: 'hsl(140 60% 45%)' }}>
                            {strengthMaxNewton}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
