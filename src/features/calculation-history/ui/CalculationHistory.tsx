'use client';

/**
 * Компонент истории расчетов
 * Показывает список предыдущих расчетов с возможностью загрузки
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCalculationStore } from '@/shared/store';
import { Upload, Trash2, History } from 'lucide-react';

export const CalculationHistory: React.FC = () => {
  const { history, loadFromHistory, removeFromHistory, clearHistory } =
    useCalculationStore();

  if (history.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <History className="h-5 w-5 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }} />
            <div className="min-w-0">
              <CardTitle className="text-base">История</CardTitle>
              <CardDescription className="text-xs">
                {history.length} расчётов
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="text-destructive hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Очистить</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 sm:p-3 rounded-lg border transition-colors"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span>
                    {item.inputs.initialWireSize}→{item.inputs.finalWireSize}мм
                  </span>
                  <span>{item.inputs.totalTransitions} пер.</span>
                  <span>{item.inputs.rodType}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    loadFromHistory(item.id);
                    setTimeout(() => {
                      document.getElementById('results')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }, 100);
                  }}
                  title="Загрузить"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeFromHistory(item.id)}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
