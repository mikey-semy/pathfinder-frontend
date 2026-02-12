'use client';

/**
 * Компонент выбора марки стали с поиском и управлением
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

// Парсинг числа с учётом запятой как десятичного разделителя
const parseNumber = (value: string): number => {
  return parseFloat(value.replace(',', '.'));
};

// Форматирование числа с запятой
const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals).replace('.', ',');
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useSteelGradesStore, type SteelGrade } from '@/shared/store';
import { Search, Plus, Pencil, Trash2, Check, ChevronDown } from 'lucide-react';

interface SteelGradeSelectorProps {
  value: string;
  onChange: (gradeId: string, grade: SteelGrade | undefined) => void;
}

export const SteelGradeSelector: React.FC<SteelGradeSelectorProps> = ({
  value,
  onChange,
}) => {
  // Состояние для предотвращения hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Подписываемся на customGrades чтобы компонент перерендеривался при изменениях
  const { customGrades, addGrade, updateGrade, removeGrade, getGradeById } =
    useSteelGradesStore();
  const { getAllGrades } = useSteelGradesStore.getState();

  // Rehydrate store on mount
  useEffect(() => {
    useSteelGradesStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<SteelGrade | null>(null);

  // Форма для добавления/редактирования
  const [formData, setFormData] = useState({
    name: '',
    carbonMin: '',
    carbonMax: '',
    tensileMin: '',
    tensileMax: '',
  });

  // Реактивно обновляем список при изменении customGrades
  const allGrades = useMemo(() => getAllGrades(), [customGrades]);
  const selectedGrade = useMemo(() => getGradeById(value), [value, customGrades]);

  // Фильтрация по поиску
  const filteredGrades = useMemo(() => {
    if (!searchQuery.trim()) return allGrades;
    const query = searchQuery.toLowerCase();
    return allGrades.filter((grade) =>
      grade.name.toLowerCase().includes(query)
    );
  }, [allGrades, searchQuery]);

  const handleSelect = (grade: SteelGrade) => {
    onChange(grade.id, grade);
    setIsOpen(false);
    setSearchQuery('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      carbonMin: '',
      carbonMax: '',
      tensileMin: '',
      tensileMax: '',
    });
    setEditingGrade(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (grade: SteelGrade) => {
    setEditingGrade(grade);
    setFormData({
      name: grade.name,
      carbonMin: grade.carbonContent.min.toString(),
      carbonMax: grade.carbonContent.max.toString(),
      tensileMin: grade.tensileStrength.min.toString(),
      tensileMax: grade.tensileStrength.max.toString(),
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    const gradeData = {
      name: formData.name.trim(),
      carbonContent: {
        min: parseNumber(formData.carbonMin),
        max: parseNumber(formData.carbonMax),
      },
      tensileStrength: {
        min: parseNumber(formData.tensileMin),
        max: parseNumber(formData.tensileMax),
      },
    };

    if (editingGrade) {
      updateGrade(editingGrade.id, gradeData);
    } else {
      // Добавляем и сразу выбираем новую марку
      const newId = addGrade(gradeData);
      const newGrade: SteelGrade = {
        ...gradeData,
        id: newId,
        isCustom: true,
      };
      onChange(newId, newGrade);
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleDelete = (grade: SteelGrade) => {
    if (grade.isCustom) {
      removeGrade(grade.id);
      if (value === grade.id) {
        onChange('', undefined);
      }
    }
  };

  const isFormValid =
    formData.name.trim() &&
    !isNaN(parseNumber(formData.carbonMin)) &&
    !isNaN(parseNumber(formData.carbonMax)) &&
    !isNaN(parseNumber(formData.tensileMin)) &&
    !isNaN(parseNumber(formData.tensileMax));

  return (
    <div className="space-y-2">
      <Label>
        Марка стали <span className="text-destructive">*</span>
      </Label>

      {/* Основной селектор */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedGrade ? selectedGrade.name : 'Выберите марку стали'}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>

        {/* Выпадающий список */}
        <div
          className={`absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg transition-all duration-200 origin-top ${
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
            {/* Поиск */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск марки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus={isOpen}
                />
              </div>
            </div>

            {/* Список марок */}
            <div className="max-h-[200px] overflow-y-auto">
              {filteredGrades.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Ничего не найдено
                </div>
              ) : (
                filteredGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer group"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left text-sm flex items-center gap-2"
                      onClick={() => handleSelect(grade)}
                    >
                      {value === grade.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span className={value === grade.id ? 'font-medium' : ''}>
                        {grade.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        C: {formatNumber(grade.carbonContent.min)}-{formatNumber(grade.carbonContent.max)}%
                      </span>
                    </button>

                    {/* Кнопки управления для пользовательских марок */}
                    {grade.isCustom && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(grade);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(grade);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Кнопка добавления */}
            <div className="p-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  openAddDialog();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить марку
              </Button>
            </div>
          </div>
      </div>

      {/* Информация о выбранной марке */}
      <p className={`text-xs text-muted-foreground min-h-[1.25rem] ${selectedGrade ? 'opacity-100' : 'opacity-0'}`}>
        {selectedGrade ? (
          <>C: {formatNumber(selectedGrade.carbonContent.min)}-{formatNumber(selectedGrade.carbonContent.max)}% |
          σв: {selectedGrade.tensileStrength.min}-{selectedGrade.tensileStrength.max} Н/мм²</>
        ) : '\u00A0'}
      </p>

      {/* Диалог добавления/редактирования */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGrade ? 'Редактировать марку' : 'Добавить марку стали'}
            </DialogTitle>
            <DialogDescription>
              Введите параметры марки стали
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gradeName">Название марки</Label>
              <Input
                id="gradeName"
                placeholder="70, 85, 90..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbonMin">Углерод мин (%)</Label>
                <Input
                  id="carbonMin"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,75"
                  value={formData.carbonMin}
                  onChange={(e) =>
                    setFormData({ ...formData, carbonMin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbonMax">Углерод макс (%)</Label>
                <Input
                  id="carbonMax"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,85"
                  value={formData.carbonMax}
                  onChange={(e) =>
                    setFormData({ ...formData, carbonMax: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tensileMin">σв мин (Н/мм²)</Label>
                <Input
                  id="tensileMin"
                  type="text"
                  inputMode="numeric"
                  placeholder="1275"
                  value={formData.tensileMin}
                  onChange={(e) =>
                    setFormData({ ...formData, tensileMin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tensileMax">σв макс (Н/мм²)</Label>
                <Input
                  id="tensileMax"
                  type="text"
                  inputMode="numeric"
                  placeholder="1305"
                  value={formData.tensileMax}
                  onChange={(e) =>
                    setFormData({ ...formData, tensileMax: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={!isFormValid}
            >
              {editingGrade ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Закрытие при клике вне */}
      <div
        className={`fixed inset-0 z-40 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
      />
    </div>
  );
};
