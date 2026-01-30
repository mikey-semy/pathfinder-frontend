'use client';

/**
 * Форма ввода параметров для расчета маршрута волочения
 * Использует React Hook Form + Zod для валидации
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Calculator, Loader2 } from 'lucide-react';
import {
  pathfinderFormSchema,
  defaultFormValues,
  type PathfinderFormData,
} from '../model/schema';
import { formDataToInputParams } from '../model/types';
import { calculateWireDrawingRoute } from '@/entities/calculation';
import type { CalculationResult } from '@/entities/calculation';
import { SteelGradeSelector } from '@/features/steel-grade-selector';
import { type SteelGrade } from '@/shared/store';

interface CalculationFormProps {
  onCalculate?: (result: CalculationResult) => void;
}

export const CalculationForm: React.FC<CalculationFormProps> = ({
  onCalculate,
}) => {
  const [selectedSteelGrade, setSelectedSteelGrade] = useState<string>('k85');
  const [isCustomSteel, setIsCustomSteel] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    setValue,
  } = useForm<PathfinderFormData>({
    resolver: zodResolver(pathfinderFormSchema),
    mode: 'onBlur', // Валидация при потере фокуса (лучше для больших форм)
    reValidateMode: 'onChange', // Ревалидация после первой попытки
    defaultValues: defaultFormValues,
  });

  // Обработчик выбора марки стали
  const handleSteelGradeChange = (gradeId: string, grade: SteelGrade | undefined) => {
    setSelectedSteelGrade(gradeId);

    if (grade) {
      setIsCustomSteel(false);
      // Автозаполнение полей
      setValue('rodType', grade.name);
      setValue('carbonContentMin', grade.carbonContent.min);
      setValue('carbonContentMax', grade.carbonContent.max);
      setValue('patentedTensileStrengthMin', grade.tensileStrength.min);
      setValue('patentedTensileStrengthMax', grade.tensileStrength.max);
    } else {
      setIsCustomSteel(true);
    }
  };

  const onSubmit = async (data: PathfinderFormData) => {
    try {
      // Преобразуем данные формы в InputParams
      const inputParams = formDataToInputParams(data);

      // Выполняем расчет
      const result = calculateWireDrawingRoute(inputParams);

      // Вызываем callback
      if (onCalculate) {
        onCalculate(result);
      }

      console.log('Результат расчета:', result);
    } catch (error) {
      console.error('Ошибка расчета:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Секция 1: Параметры проволоки */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Параметры проволоки
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Марка стали */}
              <div className="md:col-span-2">
                <SteelGradeSelector
                  value={selectedSteelGrade}
                  onChange={handleSteelGradeChange}
                />
              </div>

              {/* Диаметр заготовки */}
              <div className="space-y-2">
                <Label htmlFor="initialWireSize">
                  Диаметр заготовки (мм){' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="initialWireSize"
                  type="number"
                  step="0.01"
                  placeholder="4.0"
                  {...register('initialWireSize', { valueAsNumber: true })}
                  className={errors.initialWireSize ? 'border-destructive' : ''}
                />
                {errors.initialWireSize && (
                  <p className="text-sm text-destructive">
                    {errors.initialWireSize.message}
                  </p>
                )}
              </div>

              {/* Диаметр готовой проволоки */}
              <div className="space-y-2">
                <Label htmlFor="finalWireSize">
                  Диаметр готовой проволоки (мм){' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="finalWireSize"
                  type="number"
                  step="0.01"
                  placeholder="1.30"
                  {...register('finalWireSize', { valueAsNumber: true })}
                  className={errors.finalWireSize ? 'border-destructive' : ''}
                />
                {errors.finalWireSize && (
                  <p className="text-sm text-destructive">
                    {errors.finalWireSize.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Секция 2: Параметры материала */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Параметры материала
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Содержание углерода (мин) */}
              <div className="space-y-2">
                <Label htmlFor="carbonContentMin">
                  Содержание углерода мин (%)
                  {!isCustomSteel && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (авто)
                    </span>
                  )}
                </Label>
                <Input
                  id="carbonContentMin"
                  type="number"
                  step="0.01"
                  placeholder="0.75"
                  {...register('carbonContentMin', { valueAsNumber: true })}
                  className={errors.carbonContentMin ? 'border-destructive' : ''}
                  disabled={!isCustomSteel}
                />
                {errors.carbonContentMin && (
                  <p className="text-sm text-destructive">
                    {errors.carbonContentMin.message}
                  </p>
                )}
              </div>

              {/* Содержание углерода (макс) */}
              <div className="space-y-2">
                <Label htmlFor="carbonContentMax">
                  Содержание углерода макс (%)
                  {!isCustomSteel && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (авто)
                    </span>
                  )}
                </Label>
                <Input
                  id="carbonContentMax"
                  type="number"
                  step="0.01"
                  placeholder="0.85"
                  {...register('carbonContentMax', { valueAsNumber: true })}
                  className={errors.carbonContentMax ? 'border-destructive' : ''}
                  disabled={!isCustomSteel}
                />
                {errors.carbonContentMax && (
                  <p className="text-sm text-destructive">
                    {errors.carbonContentMax.message}
                  </p>
                )}
              </div>

              {/* σв заготовки (мин) */}
              <div className="space-y-2">
                <Label htmlFor="patentedTensileStrengthMin">
                  σв заготовки мин (кгс/мм²)
                  {!isCustomSteel && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (авто)
                    </span>
                  )}
                </Label>
                <Input
                  id="patentedTensileStrengthMin"
                  type="number"
                  step="1"
                  placeholder="130"
                  {...register('patentedTensileStrengthMin', {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.patentedTensileStrengthMin ? 'border-destructive' : ''
                  }
                  disabled={!isCustomSteel}
                />
                {errors.patentedTensileStrengthMin && (
                  <p className="text-sm text-destructive">
                    {errors.patentedTensileStrengthMin.message}
                  </p>
                )}
              </div>

              {/* σв заготовки (макс) */}
              <div className="space-y-2">
                <Label htmlFor="patentedTensileStrengthMax">
                  σв заготовки макс (кгс/мм²)
                  {!isCustomSteel && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (авто)
                    </span>
                  )}
                </Label>
                <Input
                  id="patentedTensileStrengthMax"
                  type="number"
                  step="1"
                  placeholder="133"
                  {...register('patentedTensileStrengthMax', {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.patentedTensileStrengthMax ? 'border-destructive' : ''
                  }
                  disabled={!isCustomSteel}
                />
                {errors.patentedTensileStrengthMax && (
                  <p className="text-sm text-destructive">
                    {errors.patentedTensileStrengthMax.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Секция 3: Параметры процесса */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">
              Параметры процесса волочения
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Количество переходов */}
              <div className="space-y-2">
                <Label htmlFor="totalTransitions">
                  Количество переходов{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalTransitions"
                  type="number"
                  step="1"
                  placeholder="9"
                  {...register('totalTransitions', { valueAsNumber: true })}
                  className={errors.totalTransitions ? 'border-destructive' : ''}
                />
                {errors.totalTransitions && (
                  <p className="text-sm text-destructive">
                    {errors.totalTransitions.message}
                  </p>
                )}
              </div>

              {/* Скорость волочения */}
              <div className="space-y-2">
                <Label htmlFor="drawingVelocity">
                  Скорость волочения (м/с){' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="drawingVelocity"
                  type="number"
                  step="0.1"
                  placeholder="9.0"
                  {...register('drawingVelocity', { valueAsNumber: true })}
                  className={errors.drawingVelocity ? 'border-destructive' : ''}
                />
                {errors.drawingVelocity && (
                  <p className="text-sm text-destructive">
                    {errors.drawingVelocity.message}
                  </p>
                )}
              </div>

              {/* Начать с блока */}
              <div className="space-y-2">
                <Label htmlFor="startBlock">
                  Начать с блока №
                </Label>
                <Input
                  id="startBlock"
                  type="number"
                  step="1"
                  placeholder="1"
                  {...register('startBlock', { valueAsNumber: true })}
                  className={errors.startBlock ? 'border-destructive' : ''}
                />
                {errors.startBlock && (
                  <p className="text-sm text-destructive">
                    {errors.startBlock.message}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col gap-2 pt-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Очистить</span>
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Расчет...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Рассчитать маршрут
                  </>
                )}
              </Button>
            </div>
            {/* Подсказка если форма невалидна */}
            {!isSubmitting && !isValid && (
              <p className="text-xs text-muted-foreground text-center">
                Исправьте ошибки в форме
              </p>
            )}
          </div>

          {/* Общие ошибки формы */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 border border-destructive rounded-md bg-destructive/10">
              <p className="text-sm text-destructive font-semibold">
                Исправьте ошибки в форме:
              </p>
              <ul className="list-disc list-inside text-sm text-destructive mt-2">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
