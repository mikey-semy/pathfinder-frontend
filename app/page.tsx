'use client';

/**
 * Главная страница приложения PathFinder
 * Расчет маршрутов волочения проволоки
 */

import { CalculationForm } from '@/features/calculation-form';
import { ResultsTable } from '@/features/results-display';
import { CalculationHistory } from '@/features/calculation-history';
import { ExportButton } from '@/features/results-export';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { HelpModal } from '@/shared/ui/HelpModal';
import { useCalculationStore } from '@/shared/store';
import type { CalculationResult } from '@/entities/calculation';

// Компонент для отображения входных данных при печати
const PrintInputs: React.FC<{ result: CalculationResult }> = ({ result }) => {
  const { inputs } = result;
  return (
    <div className="hidden print:block mb-4 p-2 border rounded text-sm">
      <h3 className="font-bold mb-1">Входные параметры</h3>
      <p className="text-xs text-gray-600 mb-2">Исходные данные для расчета</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <div>Марка стали: <strong>{inputs.rodType}</strong></div>
        <div>Диаметр заготовки: <strong>{inputs.initialWireSize} мм</strong></div>
        <div>Диаметр готовой: <strong>{inputs.finalWireSize} мм</strong></div>
        <div>Переходов: <strong>{inputs.totalTransitions}</strong></div>
        <div>Скорость волочения: <strong>{inputs.drawingVelocity} м/с</strong></div>
        <div>Обжатие в посл. волоке: <strong>{inputs.lastDieReduction}%</strong></div>
        <div>σв заготовки: <strong>{inputs.patentedTensileStrength.min}-{inputs.patentedTensileStrength.max} кгс/мм²</strong></div>
        <div>Углерод: <strong>{inputs.carbonContent.min}-{inputs.carbonContent.max}%</strong></div>
      </div>
    </div>
  );
};

export default function Home() {
  const { currentResult, setCurrentResult } = useCalculationStore();

  const handleCalculate = (result: CalculationResult) => {
    setCurrentResult(result);

    // Прокрутка к результатам после расчета
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* Переключатель темы */}
      <div className="no-print">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {/* Заголовок приложения */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ color: "hsl(var(--foreground))" }}
          >
            PathFinder
          </h1>
          <div className="flex items-center gap-2 no-print">
            <p
              className="text-xs sm:text-sm"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              Расчет маршрутов волочения
            </p>
            <HelpModal />
          </div>
          {/* Дата для печати */}
          {currentResult && (
            <p className="hidden print:block text-xs">
              {new Date(currentResult.timestamp).toLocaleString('ru-RU')}
            </p>
          )}
        </header>

        {/* Форма ввода - скрываем при печати */}
        <div className="mb-8 no-print">
          <CalculationForm onCalculate={handleCalculate} />
        </div>

        {/* История расчетов - скрываем при печати */}
        <div className="mb-8 no-print">
          <CalculationHistory />
        </div>

        {/* Результаты расчета */}
        {currentResult && (
          <div id="results" className="scroll-mt-8 space-y-6 print:space-y-4">
            {/* Заголовок результатов с кнопкой экспорта */}
            <div className="flex items-center justify-between gap-2 no-print">
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Результаты расчета
              </h2>
              <ExportButton />
            </div>

            {/* Входные данные - только для печати */}
            <PrintInputs result={currentResult} />

            <ResultsTable result={currentResult} />
          </div>
        )}

        {/* Информация при отсутствии результатов */}
        {!currentResult && (
          <div className="text-center py-16 no-print">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: "hsl(var(--muted))" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: "hsl(var(--muted-foreground))" }}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Введите параметры и нажмите &quot;Рассчитать маршрут&quot;
            </h3>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>
              Результаты расчета появятся здесь
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
