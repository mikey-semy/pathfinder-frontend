'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HelpModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Инструкция"
        className="no-print"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="Инструкция"
        className="no-print"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {/* Оверлей */}
      <div
        className="fixed inset-0 bg-black/50 z-50 no-print"
        onClick={() => setIsOpen(false)}
      />

      {/* Модальное окно */}
      <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-card rounded-lg shadow-xl z-50 overflow-hidden flex flex-col no-print">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Руководство по работе с PathFinder</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Введение */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Что такое PathFinder?</h3>
            <p className="text-muted-foreground leading-relaxed">
              PathFinder — программа для расчёта маршрутов волочения высокоуглеродистой проволоки.
              Она помогает определить оптимальное распределение обжатий по переходам волочильного стана
              и спрогнозировать механические свойства готовой проволоки.
            </p>
          </section>

          {/* Входные параметры */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Входные параметры</h3>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Параметры проволоки</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Марка стали</strong> — определяет химический состав и исходные механические свойства заготовки</li>
                  <li><strong>Диаметр заготовки (мм)</strong> — начальный диаметр катанки, поступающей на волочильный стан</li>
                  <li><strong>Диаметр готовой проволоки (мм)</strong> — целевой диаметр, который нужно получить (требование заказчика)</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Параметры материала</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Содержание углерода (%)</strong> — влияет на прочность и пластичность. Больше углерода = выше прочность, но ниже пластичность</li>
                  <li><strong>σв заготовки (кгс/мм²)</strong> — предел прочности патентированной заготовки. Определяется термообработкой</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Параметры процесса</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Количество переходов</strong> — сколько волок будет использовано. Больше переходов = меньше обжатие на каждом, но длиннее стан</li>
                  <li><strong>Скорость волочения (м/с)</strong> — скорость выхода готовой проволоки. Влияет на производительность</li>
                  <li><strong>Начать с блока №</strong> — с какого барабана начинать расчёт (для многониточных станов)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Результаты расчёта */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Результаты расчёта</h3>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Базовые расчёты</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Общее обжатие (%)</strong> — суммарное уменьшение площади сечения от заготовки до готовой проволоки</li>
                  <li><strong>Среднее обжатие (%)</strong> — среднее обжатие на один переход</li>
                  <li><strong>Производительность (кг/ч)</strong> — сколько килограмм проволоки производится за час</li>
                  <li><strong>За 8 часов (т)</strong> — выработка за смену</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Итоговые показатели</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>σв мин/макс (кгс/мм²)</strong> — диапазон предела прочности готовой проволоки</li>
                  <li><strong>ВСР ГП (Н/мм²)</strong> — временное сопротивление разрыву готовой проволоки в Н/мм². Формула: (σв - 5) × 9.81</li>
                  <li><strong>Удлинение</strong> — показатель пластичности проволоки</li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Таблица по блокам</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Блок</strong> — номер барабана/волоки на стане</li>
                  <li><strong>Обжатие (%)</strong> — единичное обжатие на данном переходе. Редактируемое</li>
                  <li><strong>Диаметр (мм)</strong> — диаметр проволоки после прохождения волоки. Редактируемое</li>
                  <li><strong>Σ Обжатие (%)</strong> — суммарное обжатие от начала до данного перехода</li>
                  <li><strong>σв мин/макс (Н/мм²)</strong> — прочность проволоки на данном переходе. Редактируемое</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Алгоритм настройки */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Алгоритм настройки маршрута</h3>

            <div className="space-y-4">
              <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                <h4 className="font-medium mb-2">Шаг 1: Начальный расчёт</h4>
                <p className="text-sm text-muted-foreground">
                  Введите исходные данные и нажмите «Рассчитать маршрут». Программа автоматически
                  распределит обжатия равномерно по всем переходам.
                </p>
              </div>

              <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                <h4 className="font-medium mb-2">Шаг 2: Анализ результата</h4>
                <p className="text-sm text-muted-foreground">
                  Посмотрите на итоговые значения ВСР ГП — соответствуют ли они требованиям заказчика?
                  Если нет — нужна корректировка.
                </p>
              </div>

              <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                <h4 className="font-medium mb-2">Шаг 3: Корректировка под реальный стан</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  На реальном стане есть ограничения — не все волоки доступны. Корректируйте таблицу:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Измените <strong>диаметр</strong> или <strong>обжатие</strong> в нужной строке</li>
                  <li>Все строки НИЖЕ автоматически пересчитаются</li>
                  <li>Строки ВЫШЕ останутся без изменений</li>
                  <li>Это соответствует реальности: заменили волоку → изменились все последующие переходы</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                <h4 className="font-medium mb-2">Шаг 4: Настройка последнего перехода</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Последний переход особенный — диаметр фиксирован (целевой размер заказчика).
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Измените <strong>обжатие последней строки</strong> на нужное значение</li>
                  <li>Программа автоматически подстроит диаметр предпоследней волоки</li>
                  <li>Итоговые σв и ВСР ГП обновятся</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                <h4 className="font-medium mb-2">Шаг 5: Проверка и печать</h4>
                <p className="text-sm text-muted-foreground">
                  Убедитесь, что итоговые значения ВСР ГП соответствуют требованиям.
                  Нажмите «Печать» для получения документа с маршрутом.
                </p>
              </div>
            </div>
          </section>

          {/* Советы */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Практические советы</h3>

            <div className="grid gap-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm">
                  <strong>Обжатия уменьшаются к концу маршрута</strong> — в начале 25-35%, в конце 10-20%.
                  Это связано с наклёпом металла: чем больше деформация, тем твёрже проволока.
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm">
                  <strong>Слишком малые обжатия (&lt;10%)</strong> — неэффективны, дают неоднородную
                  деформацию по сечению и снижают производительность.
                </p>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm">
                  <strong>Слишком большие обжатия (&gt;35%)</strong> — риск обрыва проволоки,
                  перегрев волоки, быстрый износ инструмента.
                </p>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-sm">
                  <strong>Оптимальный диапазон</strong> — 15-25% обжатия на переход для
                  высокоуглеродистой стали.
                </p>
              </div>
            </div>
          </section>

          {/* Горячие клавиши */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Редактирование таблицы</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Enter</strong> — применить изменение и перейти к следующей ячейке</li>
                <li><strong>Escape</strong> — отменить изменение</li>
                <li><strong>Клик вне ячейки</strong> — применить изменение</li>
                <li className="text-primary">Изменённые строки подсвечиваются зелёным цветом</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Футер */}
        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          PathFinder — расчёт маршрутов волочения проволоки
        </div>
      </div>
    </>
  );
};
