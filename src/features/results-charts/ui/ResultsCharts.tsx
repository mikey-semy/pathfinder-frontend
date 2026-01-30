'use client';

/**
 * Компонент графиков для визуализации результатов расчета
 * Использует Recharts для отображения динамики параметров по блокам
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CalculationResult } from '@/entities/calculation';

interface ResultsChartsProps {
  result: CalculationResult;
}

// Кастомный tooltip для графиков
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'hsl(var(--card-foreground))',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>
          Блок {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            style={{
              margin: 0,
              color: entry.color,
              fontSize: '11px',
            }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ResultsCharts: React.FC<ResultsChartsProps> = ({ result }) => {
  const { blocks } = result;

  // Фильтруем только активные блоки
  const activeBlocks = blocks.filter((block) => !block.isOmitted);

  // Подготовка данных для графиков
  const chartData = activeBlocks.map((block) => ({
    блок: block.blockNumber,
    диаметр: Number(block.diameter.toFixed(3)),
    скорость: Number(block.speed.toFixed(2)),
    усилие: Number((block.drawingForce / 1000).toFixed(2)),
    мощность: Number(block.power.toFixed(2)),
    обжатие: Number(block.unitReduction.toFixed(2)),
    температура: Number(block.temperatureRise.celsius.toFixed(1)),
  }));

  // Цвета для графиков
  const axisColor = 'hsl(var(--muted-foreground))';
  const gridColor = 'hsl(var(--border))';

  return (
    <div className="space-y-6 print-charts">
      {/* График диаметра и скорости */}
      <Card>
        <CardHeader>
          <CardTitle>Диаметр и скорость по блокам</CardTitle>
          <CardDescription>
            Изменение диаметра проволоки и скорости волочения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="95%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="блок"
                label={{ value: 'Блок', position: 'insideBottom', offset: -10, fill: axisColor }}
                tick={{ fill: axisColor, fontSize: 11 }}
                stroke={axisColor}
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'Ø мм', angle: -90, position: 'insideLeft', dx: -5, fill: axisColor, fontSize: 10 }}
                tick={{ fill: axisColor, fontSize: 10 }}
                stroke={axisColor}
                width={45}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'V м/с', angle: 90, position: 'insideRight', dx: 5, fill: axisColor, fontSize: 10 }}
                tick={{ fill: axisColor, fontSize: 10 }}
                stroke={axisColor}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="диаметр"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Диаметр (мм)"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="скорость"
                stroke="#22c55e"
                strokeWidth={2}
                name="Скорость (м/с)"
                dot={{ fill: '#22c55e', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* График обжатия */}
      <Card>
        <CardHeader>
          <CardTitle>Единичное обжатие по блокам</CardTitle>
          <CardDescription>
            Процент обжатия на каждом переходе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="95%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="блок"
                label={{ value: 'Блок', position: 'insideBottom', offset: -10, fill: axisColor }}
                tick={{ fill: axisColor, fontSize: 11 }}
                stroke={axisColor}
              />
              <YAxis
                label={{ value: 'Обж %', angle: -90, position: 'insideLeft', dx: -5, fill: axisColor, fontSize: 10 }}
                tick={{ fill: axisColor, fontSize: 10 }}
                stroke={axisColor}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="обжатие" fill="#ef4444" name="Обжатие (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
