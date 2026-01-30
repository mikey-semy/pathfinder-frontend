'use client';

/**
 * Компонент отображения результатов расчета маршрута волочения
 * Показывает базовые расчеты, таблицу по блокам и итоговые данные
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { CalculationResult } from '@/entities/calculation';

interface ResultsTableProps {
  result: CalculationResult;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  const { basic, blocks, summary } = result;

  // Фильтруем только активные блоки (не пропущенные)
  const activeBlocks = blocks.filter((block) => !block.isOmitted);

  // Вычисляем ВСР ГП (временное сопротивление разрыву) в Н/мм²
  // Формула: (σв - 5) * 9.81
  const vsrGpMin = summary.finalTensileStrengthNewtons?.min
    ?? Number(((summary.finalTensileStrength.min - 5) * 9.81).toFixed(1));
  const vsrGpMax = summary.finalTensileStrengthNewtons?.max
    ?? Number(((summary.finalTensileStrength.max - 5) * 9.81).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Базовые расчеты + Итоговые показатели */}
      {/* Версия для экрана */}
      <div className="flex flex-col lg:flex-row gap-6 print:hidden">
        {/* Базовые расчеты */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Базовые расчеты</CardTitle>
            <CardDescription>
              Общие параметры процесса волочения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Общее обжатие</p>
                <p className="text-2xl font-semibold" title="Общее обжатие">
                  {basic.totalReduction.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Среднее обжатие</p>
                <p className="text-2xl font-semibold" title="Среднее обжатие">
                  {basic.averageReduction.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Коэф. распределения
                </p>
                <p className="text-2xl font-semibold" title="Коэффициент распределения">
                  {basic.distributionCoefficient.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Скорость входа</p>
                <p className="text-2xl font-semibold" title="Скорость входа (м/с)">
                  {basic.inputSpeed.toFixed(2)} м/с
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Производительность
                </p>
                <p className="text-2xl font-semibold" title="Производительность (кг/ч)">
                  {basic.kgPerHour.toFixed(2)} кг/ч
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  За 8 часов
                </p>
                <p className="text-2xl font-semibold" title="Производительность за 8 часов (тонн)">
                  {basic.tonnesPer8Hours.toFixed(3)} т
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Итоговые показатели */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Итоговые показатели</CardTitle>
            <CardDescription>
              Суммарные характеристики процесса
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Треб. мощность
                </p>
                <p className="text-2xl font-semibold" title="Требуемая мощность (кВт)">
                  {summary.totalPowerRequired.toFixed(2)} кВт
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Дост. мощность
                </p>
                <p className="text-2xl font-semibold" title="Доступная мощность (кВт)">
                  {summary.totalPowerAvailable.toFixed(2)} кВт
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Исп. мощности
                </p>
                <p className="text-2xl font-semibold" title="Использование мощности (%)">
                  {summary.powerUtilization.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  σв мин / макс
                </p>
                <p className="text-2xl font-semibold" title="Временное сопротивление разрыву мин/макс (кгс/мм²)">
                  {summary.finalTensileStrength.min.toFixed(0)}-{summary.finalTensileStrength.max.toFixed(0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  ВСР ГП (Н/мм²)
                </p>
                <p className="text-2xl font-semibold" title="Временное сопротивление разрыву готовой проволоки (Н/мм²)" style={{ color: "hsl(140 60% 45%)" }}>
                  {vsrGpMin.toFixed(0)}-{vsrGpMax.toFixed(0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Удлинение
                </p>
                <p className="text-2xl font-semibold" title="Удлинение проволоки">
                  {summary.wireElongation.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Версия для печати - компактная */}
      <div className="hidden print:flex gap-4 text-sm">
        {/* Базовые расчеты */}
        <div className="flex-1 border p-2 rounded">
          <h3 className="font-bold mb-1">Базовые расчеты</h3>
          <p className="text-xs text-gray-600 mb-2">Общие параметры процесса волочения</p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1">
            <div><div className="text-gray-600 text-xs">Общее обжатие</div><strong>{basic.totalReduction.toFixed(2)}%</strong></div>
            <div><div className="text-gray-600 text-xs">Среднее обжатие</div><strong>{basic.averageReduction.toFixed(2)}%</strong></div>
            <div><div className="text-gray-600 text-xs">Коэф. распред.</div><strong>{basic.distributionCoefficient.toFixed(2)}</strong></div>
            <div><div className="text-gray-600 text-xs">Скорость входа</div><strong>{basic.inputSpeed.toFixed(2)} м/с</strong></div>
            <div><div className="text-gray-600 text-xs">Производит.</div><strong>{basic.kgPerHour.toFixed(2)} кг/ч</strong></div>
            <div><div className="text-gray-600 text-xs">За 8 часов</div><strong>{basic.tonnesPer8Hours.toFixed(3)} т</strong></div>
          </div>
        </div>

        {/* Итоговые показатели */}
        <div className="flex-1 border p-2 rounded">
          <h3 className="font-bold mb-1">Итоговые показатели</h3>
          <p className="text-xs text-gray-600 mb-2">Суммарные характеристики процесса</p>
          <div className="grid grid-cols-3 gap-x-2 gap-y-1">
            <div><div className="text-gray-600 text-xs">Треб. мощность</div><strong>{summary.totalPowerRequired.toFixed(2)} кВт</strong></div>
            <div><div className="text-gray-600 text-xs">Дост. мощность</div><strong>{summary.totalPowerAvailable.toFixed(2)} кВт</strong></div>
            <div><div className="text-gray-600 text-xs">Исп. мощности</div><strong>{summary.powerUtilization.toFixed(2)}%</strong></div>
            <div><div className="text-gray-600 text-xs">σв мин/макс</div><strong>{summary.finalTensileStrength.min.toFixed(0)}-{summary.finalTensileStrength.max.toFixed(0)}</strong></div>
            <div><div className="text-gray-600 text-xs">ВСР ГП, Н/мм²</div><strong>{vsrGpMin.toFixed(0)}-{vsrGpMax.toFixed(0)}</strong></div>
            <div><div className="text-gray-600 text-xs">Удлинение</div><strong>{summary.wireElongation.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      {/* Таблица по блокам */}
      <Card>
        <CardHeader>
          <CardTitle>Расчет по блокам</CardTitle>
          <CardDescription>
            Детальные параметры для каждого перехода волочения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card w-12 text-center p-2 font-semibold cursor-help" title="Номер блока волочения">Блок</th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Единичное обжатие на данном переходе (%)"><div>Обжатие</div><div className="font-normal text-xs">%</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Диаметр проволоки после прохода через волоку (мм)"><div>Диаметр</div><div className="font-normal text-xs">мм</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[60px]" title="Временное сопротивление разрыву - минимальное (кгс/мм²)"><div>σв</div><div className="font-normal text-xs">мин</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[60px]" title="Временное сопротивление разрыву - максимальное (кгс/мм²)"><div>σв</div><div className="font-normal text-xs">макс</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[60px]" title="Временное сопротивление разрыву - расчетное (кгс/мм²)"><div>σв</div><div className="font-normal text-xs">расч</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Скорость волочения на данном блоке (м/с)"><div>Скорость</div><div className="font-normal text-xs">м/с</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Усилие волочения (кгс)"><div>Усилие</div><div className="font-normal text-xs">кгс</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Мощность, потребляемая на данном блоке (кВт)"><div>Мощность</div><div className="font-normal text-xs">кВт</div></th>
                </tr>
              </thead>
              <tbody>
                {activeBlocks.map((block, index) => {
                  const isAverageBlock = block.blockNumber === basic.averageBlockNumber;
                  return (
                    <tr
                      key={block.blockNumber}
                      className={`hover:bg-primary/10 cursor-default transition-colors ${index % 2 === 0 ? 'bg-muted/50' : ''}`}
                    >
                      <td
                        className={`sticky left-0 z-10 p-2 text-center font-medium ${isAverageBlock ? 'text-red-500' : ''} ${index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}`}
                        title={isAverageBlock ? 'Блок со средним обжатием' : undefined}
                      >
                        {block.blockNumber}
                      </td>
                      <td className="p-2 text-center">{block.unitReduction.toFixed(2)}</td>
                      <td className="p-2 text-center">{block.diameter.toFixed(3)}</td>
                      <td className="p-2 text-center">{block.tensileStrength.min.toFixed(1)}</td>
                      <td className="p-2 text-center">{block.tensileStrength.max.toFixed(1)}</td>
                      <td className="p-2 text-center">{block.tensileStrength.calculated.toFixed(1)}</td>
                      <td className="p-2 text-center">{block.speed.toFixed(2)}</td>
                      <td className="p-2 text-center">{block.drawingForce.toFixed(0)}</td>
                      <td className="p-2 text-center">{block.power.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Дополнительная таблица с остальными параметрами */}
          <div className="mt-6 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <h4 className="font-semibold mb-3">Дополнительные параметры</h4>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card w-12 text-center p-2 font-semibold cursor-help" title="Номер блока волочения">Блок</th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Суммарное (общее) обжатие от начала до данного блока (%)"><div>Σ Обжатие</div><div className="font-normal text-xs">%</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[60px]" title="Повышение температуры проволоки (°C)"><div>Темп.</div><div className="font-normal text-xs">°C</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[60px]" title="Повышение температуры проволоки (°F)"><div>Темп.</div><div className="font-normal text-xs">°F</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Обороты в минуту барабана блока"><div>RPM</div><div className="font-normal text-xs">блока</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Обороты в минуту электродвигателя"><div>RPM</div><div className="font-normal text-xs">мотора</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Полезная мощность на валу (кВт)"><div>Полезн.</div><div className="font-normal text-xs">мощность</div></th>
                  <th className="text-center p-2 font-semibold cursor-help min-w-[70px]" title="Напряжение деформации (безразмерная величина)"><div>Напряж.</div></th>
                </tr>
              </thead>
              <tbody>
                {activeBlocks.map((block, index) => {
                  const isAverageBlock = block.blockNumber === basic.averageBlockNumber;
                  return (
                    <tr
                      key={block.blockNumber}
                      className={`hover:bg-primary/10 cursor-default transition-colors ${index % 2 === 0 ? 'bg-muted/50' : ''}`}
                    >
                      <td
                        className={`sticky left-0 z-10 p-2 text-center font-medium ${isAverageBlock ? 'text-red-500' : ''} ${index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}`}
                        title={isAverageBlock ? 'Блок со средним обжатием' : undefined}
                      >
                        {block.blockNumber}
                      </td>
                      <td className="p-2 text-center">{block.totalReduction.toFixed(2)}</td>
                      <td className="p-2 text-center">{block.temperatureRise.celsius.toFixed(1)}</td>
                      <td className="p-2 text-center">{block.temperatureRise.fahrenheit.toFixed(1)}</td>
                      <td className="p-2 text-center">{block.blockRPM.toFixed(0)}</td>
                      <td className="p-2 text-center">{block.motorRPM.toFixed(0)}</td>
                      <td className="p-2 text-center">{block.usefulPower.toFixed(2)}</td>
                      <td className="p-2 text-center">{block.strain.toFixed(3)}</td>
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
