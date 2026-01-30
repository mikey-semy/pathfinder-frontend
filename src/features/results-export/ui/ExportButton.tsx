'use client';

/**
 * Кнопки экспорта результатов
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import type { CalculationResult } from '@/entities/calculation';
import { exportToExcel } from '../lib/exportToExcel';

interface ExportButtonProps {
  result: CalculationResult;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  result,
  className,
}) => {
  const handleExport = () => {
    exportToExcel(result);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`flex gap-1 ${className || ''}`}>
      <Button
        onClick={handlePrint}
        variant="outline"
        size="sm"
        title="Печать / PDF"
        className="no-print"
      >
        <Printer className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Печать</span>
      </Button>
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        title="Экспорт в Excel"
        className="no-print"
      >
        <Download className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Excel</span>
      </Button>
    </div>
  );
};
