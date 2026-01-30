'use client';

/**
 * Компонент выбора марки стали с поиском и управлением
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const { customGrades, addGrade, updateGrade, removeGrade, getAllGrades, getGradeById } =
    useSteelGradesStore();

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

  const allGrades = getAllGrades();
  const selectedGrade = getGradeById(value);

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
        min: parseFloat(formData.carbonMin),
        max: parseFloat(formData.carbonMax),
      },
      tensileStrength: {
        min: parseFloat(formData.tensileMin),
        max: parseFloat(formData.tensileMax),
      },
    };

    if (editingGrade) {
      updateGrade(editingGrade.id, gradeData);
    } else {
      addGrade(gradeData);
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
    !isNaN(parseFloat(formData.carbonMin)) &&
    !isNaN(parseFloat(formData.carbonMax)) &&
    !isNaN(parseFloat(formData.tensileMin)) &&
    !isNaN(parseFloat(formData.tensileMax));

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
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
            {/* Поиск */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск марки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  autoFocus
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
                        C: {grade.carbonContent.min}-{grade.carbonContent.max}%
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
        )}
      </div>

      {/* Информация о выбранной марке */}
      {selectedGrade && (
        <p className="text-xs text-muted-foreground">
          C: {selectedGrade.carbonContent.min}-{selectedGrade.carbonContent.max}% |
          σв: {selectedGrade.tensileStrength.min}-{selectedGrade.tensileStrength.max} кгс/мм²
        </p>
      )}

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
                placeholder="K85"
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
                  type="number"
                  step="0.01"
                  placeholder="0.75"
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
                  type="number"
                  step="0.01"
                  placeholder="0.85"
                  value={formData.carbonMax}
                  onChange={(e) =>
                    setFormData({ ...formData, carbonMax: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tensileMin">σв мин (кгс/мм²)</Label>
                <Input
                  id="tensileMin"
                  type="number"
                  step="1"
                  placeholder="130"
                  value={formData.tensileMin}
                  onChange={(e) =>
                    setFormData({ ...formData, tensileMin: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tensileMax">σв макс (кгс/мм²)</Label>
                <Input
                  id="tensileMax"
                  type="number"
                  step="1"
                  placeholder="133"
                  value={formData.tensileMax}
                  onChange={(e) =>
                    setFormData({ ...formData, tensileMax: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={!isFormValid}>
              {editingGrade ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Закрытие при клике вне */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};
